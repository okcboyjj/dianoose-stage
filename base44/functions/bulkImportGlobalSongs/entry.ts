import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

type SeedSong = {
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  time_signature?: string;
  category?: string;
  tags?: string[];
  guitar_patch_notes?: string;
  keys_patch_notes?: string;
  production_notes?: string;
  language?: 'English' | 'Malayalam';
};

type SpotifyTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images?: Array<{ url: string; width?: number; height?: number }>;
  };
  external_urls?: { spotify?: string };
  duration_ms?: number;
};

function normalize(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function youtubeSearchUrl(title: string, artist = '') {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`.trim())}`;
}

function stylePatchNotes(song: SeedSong) {
  const text = `${song.title} ${song.artist || ''}`.toLowerCase();

  if (text.includes('rattle') || text.includes('praise') || text.includes('house')) {
    return {
      guitar:
        'Song-specific starting point: high-energy rhythm guitar, tight palm-muted groove in lower sections, crunchy drive for big choruses, and octave/lead accents where the arrangement lifts.',
      keys:
        'Song-specific starting point: rhythmic piano or organ support, bright pad layers for choruses, and subtle risers/synth texture for high-energy transitions.',
    };
  }

  if (text.includes('blessing') || text.includes('goodness') || text.includes('worthy') || text.includes('believe')) {
    return {
      guitar:
        'Song-specific starting point: sparse clean electric or acoustic early, volume swells, shimmer reverb, dotted eighth delay, and gradual overdrive only on the biggest build.',
      keys:
        'Song-specific starting point: intimate piano and warm pad, soft strings under choruses, wider cinematic pad for final builds, and gentle arpeggios that leave room for vocals.',
    };
  }

  if (text.includes('hymn') || text.includes('grace') || text.includes('christ in me')) {
    return {
      guitar:
        'Song-specific starting point: clean acoustic or electric support, hymn-like steady strumming or light arpeggios, minimal effects, and dynamics focused on congregational singing.',
      keys:
        'Song-specific starting point: piano-led modern hymn texture, subtle pad, restrained strings, and clean voicings that keep the lyric clear.',
    };
  }

  return {
    guitar:
      'Song-specific starting point: clean electric with light compression, delay matched to the song tempo, ambient swells in quiet sections, and mild drive for final choruses.',
    keys:
      'Song-specific starting point: piano and warm pad foundation, soft strings for lift, wider synth pad on builds, and restrained movement to support the vocal melody.',
  };
}

async function getSpotifyToken() {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Spotify token error ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  return (await response.json()).access_token as string;
}

async function findSpotifyTrack(token: string, seed: SeedSong) {
  const query = `${seed.title} ${seed.artist || ''}`.trim();
  const params = new URLSearchParams({ q: query, type: 'track', limit: '10' });
  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify search error ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();
  const tracks = (data?.tracks?.items || []) as SpotifyTrack[];
  const title = normalize(seed.title);
  const artist = normalize((seed.artist || '').split(',')[0]);

  return (
    tracks.find(track => normalize(track.name) === title && normalize(track.artists.map(a => a.name).join(' ')).includes(artist)) ||
    tracks.find(track => normalize(track.name).includes(title) && normalize(track.artists.map(a => a.name).join(' ')).includes(artist)) ||
    tracks[0] ||
    null
  );
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const seeds = (body?.songs || []) as SeedSong[];
    const dryRun = body?.dry_run === true;
    const limit = Math.min(Number(body?.limit || seeds.length || 0), 500);

    if (!Array.isArray(seeds) || seeds.length === 0) {
      return Response.json({ error: 'songs array is required' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.GlobalSong.list('-created_date', 2000);
    const existingKeys = new Set(
      existing.map((song: SeedSong) => `${normalize(song.title)}|${normalize((song.artist || '').split(',')[0])}`)
    );

    const token = await getSpotifyToken();
    const imported = [];
    const skipped = [];
    const failed = [];

    for (const seed of seeds.slice(0, limit)) {
      if (!seed?.title) {
        failed.push({ title: seed?.title || '(missing title)', reason: 'Missing title' });
        continue;
      }

      const duplicateKey = `${normalize(seed.title)}|${normalize((seed.artist || '').split(',')[0])}`;
      if (existingKeys.has(duplicateKey)) {
        skipped.push({ title: seed.title, reason: 'Duplicate' });
        continue;
      }

      try {
        const track = await findSpotifyTrack(token, seed);
        if (!track) {
          failed.push({ title: seed.title, reason: 'No Spotify match' });
          continue;
        }

        const spotifyArtist = track.artists.map(artist => artist.name).join(', ');
        const patches = stylePatchNotes(seed);
        const payload = {
          title: track.name,
          artist: spotifyArtist,
          album: track.album.name,
          artwork_url: track.album.images?.[0]?.url || '',
          spotify_url: track.external_urls?.spotify || '',
          youtube_url: youtubeSearchUrl(track.name, spotifyArtist),
          key: seed.key || '',
          bpm: seed.bpm || undefined,
          time_signature: seed.time_signature || '',
          capo: 0,
          category: seed.category || 'Worship',
          tags: Array.from(new Set([...(seed.tags || []), 'global-catalog', 'spotify-verified', 'youtube-search', 'needs-chart'])),
          chart_content: '',
          guitar_patch_notes: seed.guitar_patch_notes || patches.guitar,
          keys_patch_notes: seed.keys_patch_notes || patches.keys,
          production_notes:
            seed.production_notes ||
            'Imported for global catalog. Spotify metadata/artwork verified. Chart still needs manual licensed entry.',
          is_active: true,
          is_verified: false,
          language: seed.language || 'English',
          verified_status: 'Needs Review',
          source_url: track.external_urls?.spotify || '',
          source_notes: `Spotify metadata imported from track ${track.id}. YouTube link is a search link.`,
        };

        if (!dryRun) {
          const created = await base44.asServiceRole.entities.GlobalSong.create(payload);
          imported.push({ id: created?.id, title: payload.title, artist: payload.artist });
          existingKeys.add(duplicateKey);
        } else {
          imported.push({ title: payload.title, artist: payload.artist, dry_run: true });
        }
      } catch (error) {
        failed.push({ title: seed.title, reason: error?.message || String(error) });
      }
    }

    return Response.json({
      imported_count: imported.length,
      skipped_count: skipped.length,
      failed_count: failed.length,
      imported,
      skipped,
      failed,
    });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});
