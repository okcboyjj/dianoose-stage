import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Check, X, Music, Clock, Search } from "lucide-react";
import { motion } from "framer-motion";

const ServiceEntity = base44.entities.Service;

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  approved: { label: "Approved", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  rejected: { label: "Rejected", color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export default function SongSuggestionsPanel({ service, songs, currentUser, isAdmin, onChange }) {
  const suggestions = service.song_suggestions || [];
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const approvedSongIds = suggestions.filter(s => s.status === "approved").map(s => s.song_id);
  const alreadyInSetlist = service.songs || [];
  
  const availableSongs = songs.filter(s =>
    !alreadyInSetlist.includes(s.id) &&
    !suggestions.find(sg => sg.song_id === s.id) &&
    (!search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.artist?.toLowerCase().includes(search.toLowerCase()))
  );

  const addSuggestion = (song) => {
    const newSuggestion = {
      song_id: song.id,
      suggested_by: currentUser?.user_id || currentUser?.id || "",
      suggested_by_name: `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || "Unknown",
      status: isAdmin ? "approved" : "pending",
      created_at: new Date().toISOString()
    };
    const updated = [...suggestions, newSuggestion];
    onChange({ song_suggestions: updated });
    setSearch("");
    setShowAdd(false);
  };

  const updateStatus = (index, status) => {
    const updated = suggestions.map((s, i) => i === index ? { ...s, status } : s);
    onChange({ song_suggestions: updated });
  };

  const removeSuggestion = (index) => {
    const updated = suggestions.filter((_, i) => i !== index);
    onChange({ song_suggestions: updated });
  };

  const getSong = (id) => songs.find(s => s.id === id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Song Suggestions ({suggestions.length})</p>
        <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
          <Plus className="w-3 h-3" /> Suggest
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/30 rounded-xl p-3 border border-border/30 space-y-2">
          <div className="flex items-center gap-2 bg-background/50 border border-border/40 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs to suggest..." className="bg-transparent text-sm text-foreground outline-none flex-1 placeholder:text-muted-foreground" />
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {availableSongs.slice(0, 15).map(song => (
              <button key={song.id} onClick={() => addSuggestion(song)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-left group">
                <Music className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                <span className="text-sm text-foreground flex-1 truncate">{song.title}</span>
                {song.key && <span className="text-xs text-primary/60">{song.key}</span>}
                <Plus className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100" />
              </button>
            ))}
            {availableSongs.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No matching songs found</p>}
          </div>
          <button onClick={() => setShowAdd(false)} className="w-full py-1.5 rounded-lg text-xs text-muted-foreground border border-border/40 hover:bg-secondary/40 transition-colors">Cancel</button>
        </motion.div>
      )}

      {suggestions.length === 0 && !showAdd && (
        <div className="text-center py-6 text-muted-foreground">
          <Music className="w-7 h-7 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No suggestions yet</p>
          <p className="text-xs mt-0.5">Team members can suggest songs here</p>
        </div>
      )}

      <div className="space-y-2">
        {suggestions.map((suggestion, i) => {
          const song = getSong(suggestion.song_id);
          if (!song) return null;
          const cfg = STATUS_CONFIG[suggestion.status] || STATUS_CONFIG.pending;
          return (
            <div key={i} className="flex items-center gap-3 bg-secondary/20 rounded-xl px-3 py-2.5 group">
              <Music className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                <p className="text-[11px] text-muted-foreground">suggested by {suggestion.suggested_by_name}</p>
              </div>
              <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${cfg.color}`}>{cfg.label}</span>
              {isAdmin && suggestion.status === "pending" && (
                <>
                  <button onClick={() => updateStatus(i, "approved")} className="text-green-400 hover:text-green-300 transition-colors" title="Approve">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => updateStatus(i, "rejected")} className="text-red-400 hover:text-red-300 transition-colors" title="Reject">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              {(isAdmin || suggestion.suggested_by === (currentUser?.user_id || currentUser?.id)) && (
                <button onClick={() => removeSuggestion(i)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}