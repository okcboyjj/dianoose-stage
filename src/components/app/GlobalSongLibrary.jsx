import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Music, Search, Plus, Loader2, Check } from "lucide-react";

const GlobalSongEntity = base44.entities.GlobalSong;

export default function GlobalSongLibrary({ churchId, churchSongs, onSongCloned }) {
  const [globalSongs, setGlobalSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [keyFilter, setKeyFilter] = useState("All");
  const [cloning, setCloning] = useState(null);
  const [cloned, setCloned] = useState({});

  useEffect(() => {
    GlobalSongEntity.list().then(songs => {
      setGlobalSongs(songs);
      setLoading(false);
    });
  }, []);

  // Pre-mark songs already in the church library
  useEffect(() => {
    const alreadyAdded = {};
    (churchSongs || []).forEach(s => {
      if (s.global_song_id) alreadyAdded[s.global_song_id] = true;
    });
    setCloned(alreadyAdded);
  }, [churchSongs]);

  const handleAdd = async (song) => {
    if (cloning || cloned[song.id]) return;
    setCloning(song.id);
    try {
      await base44.entities.Song.create({
        title: song.title,
        artist: song.artist,
        key: song.key,
        bpm: song.bpm,
        time_signature: song.time_signature,
        capo: song.capo,
        youtube_url: song.youtube_url,
        chart_content: song.chart_content,
        guitar_patch_notes: song.guitar_patch_notes,
        keys_patch_notes: song.keys_patch_notes,
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
  };

  const filtered = globalSongs.filter(s => {
    const matchSearch = !search ||
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.artist?.toLowerCase().includes(search.toLowerCase());
    const matchKey = keyFilter === "All" || s.key === keyFilter;
    return matchSearch && matchKey;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search + key filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1 flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search global catalog..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {["All", "G", "A", "B", "C", "D", "E", "F"].map(k => (
            <button
              key={k}
              onClick={() => setKeyFilter(k)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${keyFilter === k ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Song count */}
      <p className="text-xs text-muted-foreground font-medium">{filtered.length} songs in catalog</p>

      {/* Song list */}
      <div className="grid gap-3">
        {filtered.map(song => {
          const isAdded = !!cloned[song.id];
          const isCloning = cloning === song.id;
          return (
            <div
              key={song.id}
              className="glass-panel rounded-xl px-5 py-4 flex items-center gap-4 transition-all duration-200 hover:border-primary/30"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{song.artist}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {song.key && (
                  <span className="text-xs bg-primary/10 border border-primary/20 text-primary rounded-lg px-2.5 py-1 font-bold hidden sm:block">
                    {song.key}
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={() => handleAdd(song)}
                  disabled={isAdded || isCloning}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isAdded
                      ? "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isCloning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isAdded ? (
                    <><Check className="w-3.5 h-3.5 mr-1" /> Added</>
                  ) : (
                    <><Plus className="w-3.5 h-3.5 mr-1" /> Add</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Music className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No songs found.</p>
          </div>
        )}
      </div>
    </div>
  );
}