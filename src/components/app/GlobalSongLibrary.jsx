import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Music, Search, Plus, Loader2, Check, Filter, Youtube, ExternalLink } from "lucide-react";

const GlobalSongEntity = base44.entities.GlobalSong;

// Colour-coded artist badges
const ARTIST_COLORS = {
  "Bethel Music": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Elevation Worship": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Maverick City Music": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Hillsong Worship": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Hillsong UNITED": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Passion": "bg-red-500/20 text-red-300 border-red-500/30",
  "Jesus Culture": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Phil Wickham": "bg-green-500/20 text-green-300 border-green-500/30",
  "Brandon Lake": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Kari Jobe": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "Chris Tomlin": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "UPPERROOM": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "Red Rocks Worship": "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function ArtworkThumbnail({ song }) {
  const [imgError, setImgError] = useState(false);
  const color = ARTIST_COLORS[song.artist] || "bg-primary/10";

  if (song.artwork_url && !imgError) {
    return (
      <img
        src={song.artwork_url}
        alt={song.title}
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md"
      />
    );
  }
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
      <Music className="w-5 h-5 opacity-70" />
    </div>
  );
}

const KEYS = ["All", "A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab"];
const ARTISTS = [
  "All Artists",
  "Bethel Music",
  "Elevation Worship",
  "Maverick City Music",
  "Hillsong Worship",
  "Hillsong UNITED",
  "Passion",
  "Jesus Culture",
  "Phil Wickham",
  "Brandon Lake",
  "Kari Jobe",
  "Chris Tomlin",
  "UPPERROOM",
  "Red Rocks Worship",
];

export default function GlobalSongLibrary({ churchId, churchSongs, onSongCloned }) {
  const [globalSongs, setGlobalSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [keyFilter, setKeyFilter] = useState("All");
  const [artistFilter, setArtistFilter] = useState("All Artists");
  const [cloning, setCloning] = useState(null);
  const [cloned, setCloned] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSong, setExpandedSong] = useState(null);

  useEffect(() => {
    GlobalSongEntity.list("-created_date", 300).then(songs => {
      setGlobalSongs(songs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const alreadyAdded = {};
    (churchSongs || []).forEach(s => {
      if (s.global_song_id) alreadyAdded[s.global_song_id] = true;
    });
    setCloned(alreadyAdded);
  }, [churchSongs]);

  const handleAdd = useCallback(async (song) => {
    if (cloning || cloned[song.id]) return;
    setCloning(song.id);
    try {
      await base44.entities.Song.create({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork_url: song.artwork_url,
        key: song.key,
        bpm: song.bpm,
        time_signature: song.time_signature,
        capo: song.capo,
        youtube_url: song.youtube_url,
        spotify_url: song.spotify_url,
        apple_music_url: song.apple_music_url,
        chart_content: song.chart_content,
        guitar_patch_notes: song.guitar_patch_notes,
        keys_patch_notes: song.keys_patch_notes,
        rehearsal_notes: song.rehearsal_notes,
        production_notes: song.production_notes,
        tags: song.tags,
        category: song.category,
        church_id: churchId,
        global_song_id: song.id,
      });
      setCloned(prev => ({ ...prev, [song.id]: true }));
      onSongCloned?.();
    } finally {
      setCloning(null);
    }
  }, [cloning, cloned, churchId, onSongCloned]);

  const filtered = globalSongs.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      s.title?.toLowerCase().includes(q) ||
      s.artist?.toLowerCase().includes(q) ||
      s.album?.toLowerCase().includes(q) ||
      (s.tags || []).some(t => t.toLowerCase().includes(q));
    const matchKey = keyFilter === "All" || s.key === keyFilter;
    const matchArtist = artistFilter === "All Artists" || s.artist === artistFilter;
    return matchSearch && matchKey && matchArtist;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-7 h-7 text-primary animate-spin" />
      <p className="text-xs text-muted-foreground font-medium">Loading worship catalog...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search songs, artists, albums, tags..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-medium"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50 text-muted-foreground hover:text-foreground"}`}
        >
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Key</p>
            <div className="flex flex-wrap gap-2">
              {KEYS.map(k => (
                <button key={k} onClick={() => setKeyFilter(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${keyFilter === k ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Artist</p>
            <div className="flex flex-wrap gap-2">
              {ARTISTS.map(a => (
                <button key={a} onClick={() => setArtistFilter(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${artistFilter === a ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {a === "All Artists" ? a : a.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-muted-foreground font-medium">{filtered.length} of {globalSongs.length} songs</p>

      {/* Song list */}
      <div className="grid gap-2">
        {filtered.map(song => {
          const isAdded = !!cloned[song.id];
          const isCloning = cloning === song.id;
          const isExpanded = expandedSong === song.id;
          const badgeClass = ARTIST_COLORS[song.artist] || "bg-secondary text-muted-foreground border-border/50";

          return (
            <div key={song.id} className={`glass-panel rounded-xl transition-all duration-200 ${isExpanded ? "border-primary/40" : "hover:border-primary/20"}`}>
              {/* Main row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedSong(isExpanded ? null : song.id)}
              >
                <ArtworkThumbnail song={song} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                      {song.artist?.split(" ").slice(0, 2).join(" ")}
                    </span>
                    {song.album && <span className="text-[10px] text-muted-foreground truncate max-w-[120px] hidden sm:block">{song.album}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {song.key && (
                    <span className="text-xs bg-primary/10 border border-primary/20 text-primary rounded-lg px-2 py-1 font-bold">
                      {song.key}
                    </span>
                  )}
                  {song.bpm && (
                    <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">{song.bpm} BPM</span>
                  )}
                  <Button
                    size="sm"
                    onClick={e => { e.stopPropagation(); handleAdd(song); }}
                    disabled={isAdded || isCloning}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                      isAdded
                        ? "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/20 cursor-default"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isCloning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                     isAdded ? <><Check className="w-3.5 h-3.5 mr-1" />Added</> :
                     <><Plus className="w-3.5 h-3.5 mr-1" />Add</>}
                  </Button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                  {/* Tags */}
                  {song.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {song.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick info row */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {song.time_signature && <span><b className="text-foreground">Time:</b> {song.time_signature}</span>}
                    {song.capo > 0 && <span><b className="text-foreground">Capo:</b> {song.capo}</span>}
                    {song.bpm && <span><b className="text-foreground">BPM:</b> {song.bpm}</span>}
                    {song.category && <span><b className="text-foreground">Style:</b> {song.category}</span>}
                  </div>

                  {/* Chart preview */}
                  {song.chart_content && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Chord Chart</p>
                      <pre className="bg-background/60 rounded-lg p-3 text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto border border-border/30">
                        {song.chart_content}
                      </pre>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex gap-2 flex-wrap">
                    {song.youtube_url && (
                      <a href={song.youtube_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg"
                        onClick={e => e.stopPropagation()}>
                        <Youtube className="w-3.5 h-3.5" /> YouTube
                      </a>
                    )}
                    {song.spotify_url && (
                      <a href={song.spotify_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 font-semibold transition-colors bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg"
                        onClick={e => e.stopPropagation()}>
                        <ExternalLink className="w-3.5 h-3.5" /> Spotify
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Music className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No songs found.</p>
            <p className="text-xs mt-1 opacity-60">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}