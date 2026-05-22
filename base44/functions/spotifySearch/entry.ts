import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function getSpotifyToken() {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  const creds = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { query } = await req.json();
    if (!query || query.trim().length < 2) {
      return Response.json({ results: [] });
    }

    const token = await getSpotifyToken();
    if (!token) {
      return Response.json({ error: "Failed to get Spotify token. Check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET." }, { status: 500 });
    }

    const params = new URLSearchParams({ q: query.trim(), type: "track", limit: "10" });
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      return Response.json({ error: `Spotify API error: ${searchRes.status} ${errText}` }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const tracks = searchData?.tracks?.items || [];

    const results = tracks.map(track => ({
      spotify_id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      album: track.album.name,
      artwork_url: track.album.images?.[0]?.url || null,
      artwork_url_small: track.album.images?.[2]?.url || null,
      spotify_url: track.external_urls?.spotify || null,
      preview_url: track.preview_url || null,
      duration_ms: track.duration_ms,
    }));

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});