import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Music, Search, Plus, Loader2, Check, Filter, Youtube, ExternalLink, Clock, Tag } from "lucide-react";

const GlobalSongEntity = base44.entities.GlobalSong;

const ARTIST_COLORS = {
  "Bethel Music": "bg-blue-500/15 text-blue-300 border-blue-500/25",
  "Elevation Worship": "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "Maverick City Music": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Hillsong Worship": "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  "Hillsong UNITED": "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  "Passion": "bg-red-500/15 text-red-300 border-red-500/25",
  "Jesus Culture": "bg-pink-500/15 text-pink-300 border-pink-500/25",
  "Phil Wickham": "bg-green-500/15 text-green-300 border-green-500/25",
  "Brandon Lake": "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  "Kari Jobe": "bg-rose-500/15 text-rose-300 border-rose-500/25",
  "Chris Tomlin": "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  "UPPERROOM": "bg-violet-500/15 text-violet-300 border-violet-500/25",
  "Red Rocks Worship": "bg-amber-500/15 text-amber-300 border-amber-500/25",
  "Cory Asbury": "bg-teal-500/15 text-teal-300 border-teal-500/25",
  "Pat Barrett": "bg-lime-500/15 text-lime-300 border-lime-500/25",
  "Leeland": "bg-sky-500/15 text-sky-300 border-sky-500/25",
  "Cody Carnes": "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "Rend Collective": "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25",
  "All Sons & Daughters": "bg-zinc-500/15 text-zinc-300 border-zinc-500/25",
};

function Artwork({ song, size = "md" }) {
  const [err, setErr] = useState(false);
  const s = size === "lg" ? "w-16 h-16" : "w-11 h-11";
  const color = ARTIST_COLORS[song.artist] || "bg-primary/10 border-primary/20";

  if (song.artwork_url && !err) {
    return (
      <img src={song.artwork_url} alt={song.title} loading="lazy"
        onError={() => setErr(true)}
        className={`${s} rounded-xl object-cover shrink-0 shadow-md`} />
    );
  }
  return (
    <div className={`${s} rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
      <Music className="w-4 h-4 opacity-60" />
    </div>
  );
}

const KEY_COLORS = {
  "C": "bg-red-500/10 text-red-300 border-red-500/20",
  "C#": "bg-orange-500/10 text-orange-300 border-orange-500/20",
  "D": "bg-amber-500/10 text-amber-300 border-amber-500/20",
  "Eb": "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  "E": "bg-lime-500/10 text-lime-300 border-lime-500/20",
  "F": "bg-green-500/10 text-green-300 border-green-500/20",
  "F#": "bg-teal-500/10 text-teal-300 border-teal-500/20",
  "G": "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  "Ab": "bg-sky-500/10 text-sky-300 border-sky-500/20",
  "A": "bg-blue-500/10 text-blue-300 border-blue-500/20",
  "Bb": "bg-violet-500/10 text-violet-300 border-violet-500/20",
  "B": "bg-purple-500/10 text-purple-300 border-purple-500/20",
};

const KEYS = ["All", "A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab"];

export default function GlobalSongLibrary({ churchId, churchSongs, onSongCloned }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [keyFilter, setKeyFilter] = useState("All");
  const [artistFilter, setArtistFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [cloning, setCloning] = useState(null);
  const [cloned, setCloned] = useState({});

  useEffect(() => {
    GlobalSongEntity.list("-created_date", 300).then(data => {
      setSongs(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const map = {};
    (churchSongs || []).forEach(s => { if (s.global_song_id) map[s.global_song_id] = true; });
    setCloned(map);
  }, [churchSongs]);

  const artists = ["All", ...Array.from(new Set(songs.map(s => s.artist).filter(Boolean))).sort()];

  const handleAdd = useCallback(async (song) => {
    if (cloning || cloned[song.id]) return;
    setCloning(song.id);
    try {
      await base44.entities.Song.create({
        title: song.title, artist: song.artist, album: song.album,
        artwork_url: song.artwork_url, key: song.key, bpm: song.bpm,
        time_signature: song.time_signature, capo: song.capo,
        youtube_url: song.youtube_url, spotify_url: song.spotify_url,
        apple_music_url: song.apple_music_url, chart_content: song.chart_content,
        guitar_patch_notes: song.guitar_patch_notes, keys_patch_notes: song.keys_patch_notes,
        production_notes: song.production_notes, tags: song.tags,
        category: song.category, church_id: churchId, global_song_id: song.id,
      });
      setCloned(prev => ({ ...prev, [song.id]: true }));
      onSongCloned?.();
    } finally { setCloning(null); }
  }, [cloning, cloned, churchId, onSongCloned]);

  const filtered = songs.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      s.title?.toLowerCase().includes(q) ||
      s.artist?.toLowerCase().includes(q) ||
      s.album?.toLowerCase().includes(q) ||
      (s.tags || []).some(t => t.toLowerCase().includes(q));
    const matchKey = keyFilter === "All" || s.key === keyFilter;
    const matchArtist = artistFilter === "All" || s.artist === artistFilter;
    return matchSearch && matchKey && matchArtist;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
      <p className="text-xs text-muted-foreground font-medium">Loading worship catalog...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search + Filter toggle */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3.5 py-2.5 focus-within:border-primary/50 transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search songs, artists, albums, tags..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-medium" />
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50 text-muted-foreground hover:text-foreground"}`}>
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card border border-border/40 rounded-xl p-4 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Key</p>
            <div className="flex flex-wrap gap-1.5">
              {KEYS.map(k => (
                <button key={k} onClick={() => setKeyFilter(k)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${keyFilter === k ? "bg-primary text-primary-foreground border-primary" : `${KEY_COLORS[k] || "bg-secondary text-muted-foreground border-border/40"} hover:opacity-80`}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Artist</p>
            <div className="flex flex-wrap gap-1.5">
              {artists.map(a => {
                const bc = ARTIST_COLORS[a];
                return (
                  <button key={a} onClick={() => setArtistFilter(a)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${artistFilter === a ? "bg-primary text-primary-foreground border-primary" : `${bc || "bg-secondary text-muted-foreground border-border/40"} hover:opacity-80`}`}>
                    {a === "All" ? "All Artists" : a.split(" ").slice(0, 2).join(" ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-muted-foreground font-medium">
        {filtered.length} of {songs.length} songs
        {keyFilter !== "All" && <span className="ml-1 text-primary font-bold">· Key of {keyFilter}</span>}
      </p>

      {/* Song list */}
      <div className="grid gap-2">
        {filtered.map(song => {
          const isAdded = !!cloned[song.id];
          const isCloning = cloning === song.id;
          const isOpen = expanded === song.id;
          const badgeClass = ARTIST_COLORS[song.artist] || "bg-secondary text-muted-foreground border-border/40";
          const keyClass = KEY_COLORS[song.key] || "bg-primary/10 text-primary border-primary/20";

          return (
            <div key={song.id}
              className={`bg-card border rounded-xl transition-all duration-200 overflow-hidden ${isOpen ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border/40 hover:border-border/70"}`}>

              {/* Main row */}
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => setExpanded(isOpen ? null : song.id)}>
                <Artwork song={song} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{song.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                      {song.artist}
                    </span>
                    {song.album && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[130px] hidden sm:block opacity-70">
                        {song.album}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta pills */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {song.key && (
                    <span className={`text-[11px] font-bold border rounded-lg px-2.5 py-1 ${keyClass}`}>
                      {song.key}
                    </span>
                  )}
                  {song.bpm && (
                    <span className="text-[10px] text-muted-foreground font-semibold hidden sm:flex items-center gap-1">
                      <Clock className="w-3 h-3" />{song.bpm}
                    </span>
                  )}
                  {song.time_signature && (
                    <span className="text-[10px] bg-secondary text-muted-foreground border border-border/40 rounded-md px-2 py-0.5 font-bold hidden md:block">
                      {song.time_signature}
                    </span>
                  )}
                  <Button size="sm" onClick={e => { e.stopPropagation(); handleAdd(song); }}
                    disabled={isAdded || isCloning}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold ml-1 transition-all ${
                      isAdded
                        ? "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/20 cursor-default"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}>
                    {isCloning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                     isAdded ? <><Check className="w-3.5 h-3.5 mr-1" />Added</> :
                     <><Plus className="w-3.5 h-3.5 mr-1" />Add</>}
                  </Button>
                </div>
              </div>

              {/* Expanded panel */}
              {isOpen && (
                <div className="border-t border-border/30 bg-background/30 px-4 pb-4 pt-3 space-y-3">
                  {/* Full meta row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                    {song.bpm && <span className="text-muted-foreground"><b className="text-foreground">BPM</b> {song.bpm}</span>}
                    {song.time_signature && <span className="text-muted-foreground"><b className="text-foreground">Time</b> {song.time_signature}</span>}
                    {song.capo > 0 && <span className="text-muted-foreground"><b className="text-foreground">Capo</b> {song.capo}</span>}
                    {song.category && <span className="text-muted-foreground"><b className="text-foreground">Style</b> {song.category}</span>}
                  </div>

                  {/* Tags */}
                  {song.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                      {song.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium border border-border/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Patch notes preview */}
                  {(song.guitar_patch_notes || song.keys_patch_notes) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {song.guitar_patch_notes && (
                        <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">🎸 Guitar</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{song.guitar_patch_notes.split('\n')[0]}</p>
                        </div>
                      )}
                      {song.keys_patch_notes && (
                        <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">🎹 Keys</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{song.keys_patch_notes.split('\n')[0]}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex gap-2 flex-wrap pt-0.5">
                    {song.youtube_url && (
                      <a href={song.youtube_url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
                        <Youtube className="w-3.5 h-3.5" /> YouTube
                      </a>
                    )}
                    {song.spotify_url && (
                      <a href={song.spotify_url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 font-semibold bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Spotify
                      </a>
                    )}
                    {!isAdded && (
                      <Button size="sm" onClick={e => { e.stopPropagation(); handleAdd(song); }}
                        disabled={isCloning}
                        className="h-8 px-4 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 ml-auto">
                        {isCloning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5 mr-1" />Add to My Library</>}
                      </Button>
                    )}
                    {isAdded && (
                      <span className="ml-auto flex items-center gap-1.5 text-xs text-accent font-semibold">
                        <Check className="w-3.5 h-3.5" /> Added to library
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-14 text-muted-foreground">
            <Music className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No songs match your search.</p>
            <p className="text-xs mt-1 opacity-60">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}