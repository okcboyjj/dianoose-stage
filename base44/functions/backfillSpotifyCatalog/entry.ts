import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

type GlobalSong = {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  artwork_url?: string;
  spotify_url?: string;
  tags?: string[];
  key?: string;
  bpm?: number;
  time_signature?: string;
  guitar_patch_notes?: string;
  keys_patch_notes?: string;
  production_notes?: string;
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
};

function normalize(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeTitle(value = '') {
  return normalize(value)
    .replace(/\b(live|radio|edit|version|acoustic|studio|single|feat|featuring|ft|remastered|spontaneous)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGenericPatch(value = '') {
  const text = value.toLowerCase();
  return (
    !text ||
    text.includes('song-specific starting point') ||
    text.includes('clean electric with light compression') ||
    text.includes('piano and warm pad foundation') ||
    text.includes('imported from sourced worship metadata')
  );
}

function spotifyMatch(song: GlobalSong, track: SpotifyTrack | null) {
  if (!track) return false;
  const songTitle = normalizeTitle(song.title);
  const trackTitle = normalizeTitle(track.name);
  if (!songTitle || !trackTitle) return false;
  return trackTitle === songTitle || trackTitle.includes(songTitle) || songTitle.includes(trackTitle);
}

function buildPatchNotes(song: GlobalSong, track?: SpotifyTrack) {
  const bpm = typeof song.bpm === 'number' ? song.bpm : 0;
  const title = `${song.title} ${track?.name || ''}`.toLowerCase();
  const artist = `${song.artist || ''} ${track?.artists?.map(a => a.name).join(' ') || ''}`.toLowerCase();
  const time = song.time_signature || '4/4';
  const key = song.key ? `Key ${song.key}` : 'original key';
  const tempo = bpm ? `${Math.round(bpm)} BPM` : 'mid-tempo';

  if (bpm >= 115 || title.includes('praise') || title.includes('alive') || title.includes('victory')) {
    return {
      guitar_patch_notes: `${key}, ${tempo}. Drive the song with tight rhythmic parts, muted verses, bright chorus strums, and a bigger overdriven lift on final choruses. Add short lead/octave hooks around intros and turnarounds without crowding vocals.`,
      keys_patch_notes: `${key}, ${time}. Use rhythmic piano or synth pulse for motion, bright pad layers on choruses, and organ/synth support for high-energy sections. Keep verse voicings tight so the groove stays clean.`,
      production_notes: `High-energy praise arrangement. Build from controlled verses into wide choruses, keep transitions tight, and use simple click/cue language for stops, turnarounds, and final chorus lift.`,
    };
  }

  if (bpm && bpm <= 76 || title.includes('holy') || title.includes('worthy') || title.includes('presence') || title.includes('surrender')) {
    return {
      guitar_patch_notes: `${key}, ${tempo}. Use ambient clean electric, volume swells, dotted delay, shimmer/reverb tails, and restrained picking. Save drive for the biggest bridge or final chorus only.`,
      keys_patch_notes: `${key}, ${time}. Lead with warm piano and soft pad, add gentle strings under choruses, and widen the pad during bridge builds. Leave space for vocal moments and prayer transitions.`,
      production_notes: `Worship-ballad feel. Keep dynamics patient, avoid overplaying early, and mark where the band should swell, drop, or repeat for ministry moments.`,
    };
  }

  if (artist.includes('hillsong') || artist.includes('elevation') || artist.includes('bethel')) {
    return {
      guitar_patch_notes: `${key}, ${tempo}. Modern worship electric approach: clean arpeggios or swells in verses, dotted delay texture, and layered drive on choruses. Double simple hooks when the arrangement opens up.`,
      keys_patch_notes: `${key}, ${time}. Piano/pad foundation with soft synth texture. Support the melody early, then add wider pads and strings for bridge and final chorus lift.`,
      production_notes: `Modern worship build. Track intro, verse, chorus, bridge, and final tag clearly; keep space for spontaneous repeats and dynamic drops.`,
    };
  }

  return {
    guitar_patch_notes: `${key}, ${tempo}. Start clean and supportive, use tempo-matched delay, light swells in quiet sections, and medium drive for chorus lift. Keep parts simple enough for the vocal to lead.`,
    keys_patch_notes: `${key}, ${time}. Use piano plus warm pad as the base, add soft strings for lift, and keep synth movement subtle unless the song needs a bigger final build.`,
    production_notes: `Congregational worship arrangement. Keep cues clear, support dynamic growth across sections, and leave space for repeats, prayer, or a soft ending.`,
  };
}

async function getSpotifyToken() {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('Missing Spotify secrets');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Spotify token error ${response.status}`);
  }

  return (await response.json()).access_token as string;
}

async function findSpotifyTrack(token: string, song: GlobalSong) {
  const query = `${song.title} ${song.artist || ''}`.trim();
  const params = new URLSearchParams({ q: query, type: 'track', limit: '5' });
  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 429) {
    throw new Error('Spotify rate limit');
  }

  if (!response.ok) {
    throw new Error(`Spotify search error ${response.status}`);
  }

  const data = await response.json();
  const tracks = (data?.tracks?.items || []) as SpotifyTrack[];
  return tracks.find(track => spotifyMatch(song, track)) || tracks[0] || null;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const expectedSecret = Deno.env.get('BACKFILL_SECRET');
    const providedSecret = req.headers.get('x-backfill-secret');
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit || 20), 50);
    const base44 = createClientFromRequest(req);
    const songs = (await base44.asServiceRole.entities.GlobalSong.list('-created_date', 1000)) as GlobalSong[];
    const needsWork = songs.filter(song =>
      !song.artwork_url ||
      !song.spotify_url ||
      isGenericPatch(song.guitar_patch_notes) ||
      isGenericPatch(song.keys_patch_notes) ||
      isGenericPatch(song.production_notes)
    );

    const spotifyToken = await getSpotifyToken();
    const updated = [];
    const skipped = [];
    let checked = 0;

    for (const song of needsWork) {
      if (updated.length >= limit) break;
      checked += 1;

      try {
        const track = (!song.artwork_url || !song.spotify_url) ? await findSpotifyTrack(spotifyToken, song) : null;
        const patch = buildPatchNotes(song, track || undefined);
        const update: Record<string, unknown> = {};

        if (track) {
          if (!song.artwork_url) update.artwork_url = track.album.images?.[0]?.url || '';
          if (!song.spotify_url) update.spotify_url = track.external_urls?.spotify || '';
          if (!song.album) update.album = track.album.name || '';
        }

        if (isGenericPatch(song.guitar_patch_notes)) update.guitar_patch_notes = patch.guitar_patch_notes;
        if (isGenericPatch(song.keys_patch_notes)) update.keys_patch_notes = patch.keys_patch_notes;
        if (isGenericPatch(song.production_notes)) update.production_notes = patch.production_notes;

        if (Object.keys(update).length === 0) {
          skipped.push({ title: song.title, reason: 'No update needed' });
          continue;
        }

        await base44.asServiceRole.entities.GlobalSong.update(song.id, update);
        updated.push({ title: song.title, fields: Object.keys(update) });
      } catch (error) {
        const message = error?.message || String(error);
        skipped.push({ title: song.title, reason: message });
        if (message.includes('rate limit')) break;
      }
    }

    return Response.json({
      checked,
      updated_count: updated.length,
      skipped_count: skipped.length,
      remaining_estimate: Math.max(needsWork.length - updated.length, 0),
      updated,
      skipped,
    });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});
