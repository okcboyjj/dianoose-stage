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

type PlaylistSeed = {
  id: string;
  label?: string;
  category?: string;
  tags?: string[];
};

type AudioFeatures = {
  id: string;
  key?: number;
  mode?: number;
  tempo?: number;
  time_signature?: number;
};

const KEY_NAMES_MAJOR = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const KEY_NAMES_MINOR = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];

function normalize(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeTitle(value = '') {
  return normalize(value)
    .replace(/\b(live|radio|edit|version|acoustic|studio|single|feat|featuring|ft|remastered|spontaneous)\b/g, ' ')
    .replace(/\bfrom\s+the\s+.*$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function confidentSpotifyMatch(seed: SeedSong, track: SpotifyTrack | null) {
  if (!track) return false;

  const seedTitle = normalizeTitle(seed.title);
  const seedArtist = normalize((seed.artist || '').split(',')[0]);
  const trackTitle = normalizeTitle(track.name);
  const trackArtists = normalize(track.artists.map(artist => artist.name).join(' '));
  const titleMatches =
    trackTitle === seedTitle ||
    trackTitle.includes(seedTitle) ||
    seedTitle.includes(trackTitle);
  const artistMatches =
    !seedArtist ||
    trackArtists.includes(seedArtist) ||
    seedArtist.includes(trackArtists.split(' ')[0] || '');

  return titleMatches || (artistMatches && seedTitle.split(' ').some(word => word.length > 4 && trackTitle.includes(word)));
}

function youtubeSearchUrl(title: string, artist = '') {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`.trim())}`;
}

function spotifyKey(feature?: AudioFeatures) {
  if (!feature || feature.key === undefined || feature.key < 0) return '';
  return feature.mode === 0 ? KEY_NAMES_MINOR[feature.key] : KEY_NAMES_MAJOR[feature.key];
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

async function getPlaylistTracks(token: string, playlist: PlaylistSeed) {
  const tracks: SpotifyTrack[] = [];
  let next:
    | string
    | null = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=100&fields=next,items(track(id,name,artists(name),album(name,images),external_urls,duration_ms))`;

  while (next && tracks.length < 500) {
    const response = await fetch(next, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      throw new Error(`Spotify playlist error ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }
    const data = await response.json();
    for (const item of data?.items || []) {
      if (item?.track?.id && item.track.name) tracks.push(item.track);
    }
    next = data?.next || null;
  }

  return tracks;
}

async function getAudioFeatures(token: string, tracks: SpotifyTrack[]) {
  const features = new Map<string, AudioFeatures>();

  for (let i = 0; i < tracks.length; i += 100) {
    const ids = tracks.slice(i, i + 100).map(track => track.id).join(',');
    if (!ids) continue;

    const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) continue;
    const data = await response.json();
    for (const feature of data?.audio_features || []) {
      if (feature?.id) features.set(feature.id, feature);
    }
  }

  return features;
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
    const playlists = (body?.playlists || []) as PlaylistSeed[];
    const dryRun = body?.dry_run === true;
    const limit = Math.min(Number(body?.limit || seeds.length || 0), 500);

    if ((!Array.isArray(seeds) || seeds.length === 0) && (!Array.isArray(playlists) || playlists.length === 0)) {
      return Response.json({ error: 'songs or playlists array is required' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.GlobalSong.list('-created_date', 2000);
    const existingKeys = new Set(
      existing.map((song: SeedSong) => `${normalize(song.title)}|${normalize((song.artist || '').split(',')[0])}`)
    );

    const token = await getSpotifyToken();
    const imported = [];
    const skipped = [];
    const failed = [];
    const playlistTracks: Array<{ track: SpotifyTrack; playlist: PlaylistSeed }> = [];

    for (const playlist of playlists) {
      try {
        const tracks = await getPlaylistTracks(token, playlist);
        for (const track of tracks) playlistTracks.push({ track, playlist });
      } catch (error) {
        failed.push({ title: playlist.label || playlist.id, reason: error?.message || String(error) });
      }
    }

    const audioFeatures = await getAudioFeatures(token, playlistTracks.map(item => item.track));

    for (const item of playlistTracks) {
      if (imported.length >= limit) break;
      const track = item.track;
      const playlist = item.playlist;
      const spotifyArtist = track.artists.map(artist => artist.name).join(', ');
      const duplicateKey = `${normalize(track.name)}|${normalize((spotifyArtist || '').split(',')[0])}`;

      if (existingKeys.has(duplicateKey)) {
        skipped.push({ title: track.name, reason: 'Duplicate' });
        continue;
      }

      const feature = audioFeatures.get(track.id);
      const seed: SeedSong = {
        title: track.name,
        artist: spotifyArtist,
        key: spotifyKey(feature),
        bpm: feature?.tempo ? Math.round(feature.tempo) : undefined,
        time_signature: feature?.time_signature ? `${feature.time_signature}/4` : '4/4',
        category: playlist.category || 'Worship',
        tags: playlist.tags || [],
      };
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
        tags: Array.from(new Set([
          ...(seed.tags || []),
          'global-catalog',
          'spotify-verified',
          'spotify-playlist-import',
          'youtube-search',
          'needs-chart',
        ])),
        chart_content: '',
        guitar_patch_notes: patches.guitar,
        keys_patch_notes: patches.keys,
        production_notes: `Imported from Spotify playlist${playlist.label ? `: ${playlist.label}` : ''}. Chart still needs manual licensed entry.`,
        is_active: true,
        is_verified: true,
        language: 'English',
        verified_status: 'Verified',
        source_url: track.external_urls?.spotify || '',
        source_notes: `Spotify playlist metadata imported from track ${track.id}. YouTube link is a search link.`,
      };

      if (!dryRun) {
        const created = await base44.asServiceRole.entities.GlobalSong.create(payload);
        imported.push({ id: created?.id, title: payload.title, artist: payload.artist });
        existingKeys.add(duplicateKey);
      } else {
        imported.push({ title: payload.title, artist: payload.artist, dry_run: true });
      }
    }

    for (const seed of seeds) {
      if (imported.length >= limit) break;
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
        if (!confidentSpotifyMatch(seed, track)) {
          failed.push({ title: seed.title, reason: 'Skipped: no high-confidence Spotify match' });
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
          is_verified: true,
          language: seed.language || 'English',
          verified_status: 'Verified',
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
