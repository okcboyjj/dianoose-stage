import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Mic, Mic2, Music, Users, Headphones, ChevronDown, ChevronUp, Settings2, Loader2, Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const ServiceEntity = base44.entities.Service;

const ROLE_SLOTS = [
  { key: "worship_leader", label: "Worship Leader", icon: Mic, color: "text-primary" },
  { key: "vocal_1", label: "Lead Vocals", icon: Mic2, color: "text-accent" },
  { key: "vocal_2", label: "BG Vocals 1", icon: Mic2, color: "text-muted-foreground" },
  { key: "vocal_3", label: "BG Vocals 2", icon: Mic2, color: "text-muted-foreground" },
  { key: "guitar_lead", label: "Lead Guitar", icon: Music, color: "text-yellow-400" },
  { key: "guitar_rhythm", label: "Rhythm Guitar", icon: Music, color: "text-yellow-300" },
  { key: "bass", label: "Bass", icon: Music, color: "text-purple-400" },
  { key: "keys_1", label: "Keys 1", icon: Music, color: "text-blue-400" },
  { key: "keys_2", label: "Keys 2", icon: Music, color: "text-blue-300" },
  { key: "drums", label: "Drums", icon: Music, color: "text-red-400" },
  { key: "production", label: "Production", icon: Settings2, color: "text-green-400" },
  { key: "iem_mix", label: "IEM Mix", icon: Headphones, color: "text-orange-400" },
];

const MIC_SLOTS = [
  { key: "mic_vox1", label: "Vox 1 (Chan 1)" },
  { key: "mic_vox2", label: "Vox 2 (Chan 2)" },
  { key: "mic_vox3", label: "Vox 3 (Chan 3)" },
  { key: "mic_vox4", label: "Vox 4 (Chan 4)" },
  { key: "mic_kick", label: "Kick (Chan 5)" },
  { key: "mic_snare", label: "Snare (Chan 6)" },
  { key: "mic_guitar", label: "Guitar DI (Chan 7)" },
  { key: "mic_keys", label: "Keys L (Chan 8)" },
];

function SongRundownCard({ song, index, songData, members, isAdmin, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(songData?.arrangement_notes || "");
  const [transition, setTransition] = useState(songData?.transition || "");
  const [leader, setLeader] = useState(songData?.song_leader || "");

  const save = async () => {
    onUpdate(song.id, { arrangement_notes: notes, transition, song_leader: leader });
  };

  return (
    <div className="bg-card/60 border border-border/40 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{song?.title || "Unknown Song"}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{song?.artist}</span>
            {song?.key && <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">{song.key}</span>}
            {song?.bpm && <span className="text-[10px] text-muted-foreground">{song.bpm} BPM</span>}
          </div>
        </div>
        {leader && <span className="text-[10px] bg-secondary text-muted-foreground rounded-full px-2 py-0.5 shrink-0 truncate max-w-[80px]">{leader}</span>}
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>
      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-3 pb-3 space-y-3 border-t border-border/30">
          <div className="pt-3">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Song Leader</label>
            <Input value={leader} onChange={e => setLeader(e.target.value)} placeholder="Who leads this song?" className="mt-1 bg-background/50 border-border/50 text-xs h-8" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Arrangement Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="V1, Pre, Chorus x2, Bridge, Tag..." rows={2} className="mt-1 bg-background/50 border-border/50 text-xs resize-none" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Transition to Next Song</label>
            <Input value={transition} onChange={e => setTransition(e.target.value)} placeholder="Hold last chord, key change to G, cold stop..." className="mt-1 bg-background/50 border-border/50 text-xs h-8" />
          </div>
          {isAdmin && (
            <Button onClick={save} size="sm" className="bg-primary text-primary-foreground h-7 text-xs rounded-lg">
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function MorningWorshipPanel({ service, songs, members, isAdmin, onUpdate }) {
  const [activeTab, setActiveTab] = useState("rundown");
  const [saving, setSaving] = useState(false);

  // Parse the service song IDs → actual song objects
  const serviceSongs = (service?.songs || [])
    .map(id => songs.find(s => s.id === id))
    .filter(Boolean);

  // Production metadata stored on service object
  const productionData = service?.production_data || {};
  const [localProd, setLocalProd] = useState(productionData);

  const setSlot = (key, val) => setLocalProd(p => ({ ...p, [key]: val }));

  const saveProd = async () => {
    setSaving(true);
    try {
      await ServiceEntity.update(service.id, { production_data: localProd });
      onUpdate?.();
    } finally { setSaving(false); }
  };

  const updateSongData = (songId, data) => {
    const songDataMap = { ...(service.song_rundown_data || {}), [songId]: { ...(service.song_rundown_data?.[songId] || {}), ...data } };
    ServiceEntity.update(service.id, { song_rundown_data: songDataMap });
  };

  const TABS = [
    { id: "rundown", label: "🎵 Rundown" },
    { id: "team", label: "👥 Team" },
    { id: "mics", label: "🎤 Mics/IEM" },
    { id: "production", label: "🎛 Production" },
  ];

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">🎶</div>
        <p className="text-sm font-semibold text-foreground">No service selected</p>
        <p className="text-xs text-muted-foreground mt-1">Select a service from the Services tab to manage the morning worship rundown</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Service header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Morning Worship Command Center</p>
            <h2 className="text-lg font-bold text-foreground">{service.name}</h2>
            <p className="text-xs text-muted-foreground">
              {service.date ? new Date(service.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}
              {service.time ? ` · ${service.time}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{serviceSongs.length}</p>
            <p className="text-[10px] text-muted-foreground">Songs</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-secondary/20 rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === t.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

          {activeTab === "rundown" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Song order with leaders, arrangement notes, and transitions</p>
              {serviceSongs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No songs in this service yet</p>
                </div>
              ) : (
                serviceSongs.map((song, i) => (
                  <SongRundownCard
                    key={song.id}
                    song={song}
                    index={i}
                    songData={service.song_rundown_data?.[song.id]}
                    members={members}
                    isAdmin={isAdmin}
                    onUpdate={updateSongData}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Assign each role for this service</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLE_SLOTS.map(slot => {
                  const IconComp = slot.icon;
                  return (
                    <div key={slot.key} className="bg-card/60 border border-border/40 rounded-xl p-3 flex items-center gap-3">
                      <IconComp className={`w-4 h-4 ${slot.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{slot.label}</p>
                        <input
                          value={localProd[slot.key] || ""}
                          onChange={e => setSlot(slot.key, e.target.value)}
                          placeholder="Assign team member..."
                          list={`members-${slot.key}`}
                          className="bg-transparent text-xs text-foreground outline-none w-full mt-0.5 placeholder:text-muted-foreground/50"
                        />
                        <datalist id={`members-${slot.key}`}>
                          {members.map(m => <option key={m.id} value={`${m.first_name} ${m.last_name}`} />)}
                        </datalist>
                      </div>
                    </div>
                  );
                })}
              </div>
              {isAdmin && (
                <Button onClick={saveProd} disabled={saving} className="w-full bg-primary text-primary-foreground h-10 rounded-xl font-semibold mt-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Team Assignments</>}
                </Button>
              )}
            </div>
          )}

          {activeTab === "mics" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Mic assignments and IEM mixes</p>
              <div className="space-y-1.5">
                {MIC_SLOTS.map(slot => (
                  <div key={slot.key} className="bg-card/60 border border-border/40 rounded-xl p-3 flex items-center gap-3">
                    <Mic className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="w-28 shrink-0">
                      <p className="text-[10px] text-muted-foreground font-semibold">{slot.label}</p>
                    </div>
                    <input
                      value={localProd[slot.key] || ""}
                      onChange={e => setSlot(slot.key, e.target.value)}
                      placeholder="Who?"
                      list="members-list"
                      className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                ))}
                <datalist id="members-list">
                  {members.map(m => <option key={m.id} value={`${m.first_name} ${m.last_name}`} />)}
                </datalist>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-foreground mb-2">IEM Mix Notes</p>
                <Textarea
                  value={localProd.iem_notes || ""}
                  onChange={e => setSlot("iem_notes", e.target.value)}
                  placeholder="IEM mix preferences, click track routing, in-ear notes..."
                  rows={4}
                  className="bg-background/50 border-border/50 text-xs resize-none"
                />
              </div>
              {isAdmin && (
                <Button onClick={saveProd} disabled={saving} className="w-full bg-primary text-primary-foreground h-10 rounded-xl font-semibold">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Mic/IEM</>}
                </Button>
              )}
            </div>
          )}

          {activeTab === "production" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-2 block">Production Notes</label>
                <Textarea
                  value={localProd.production_notes || ""}
                  onChange={e => setSlot("production_notes", e.target.value)}
                  placeholder="Lighting cues, video notes, confidence monitors, stage plot, click track BPMs, click patches..."
                  rows={6}
                  className="bg-background/50 border-border/50 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-2 block">Pre-Service Checklist</label>
                <Textarea
                  value={localProd.checklist || ""}
                  onChange={e => setSlot("checklist", e.target.value)}
                  placeholder="Sound check order, prayer time, run order notes..."
                  rows={4}
                  className="bg-background/50 border-border/50 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-2 block">Rehearsal Notes</label>
                <Textarea
                  value={localProd.rehearsal_notes || ""}
                  onChange={e => setSlot("rehearsal_notes", e.target.value)}
                  placeholder="What to work on in rehearsal, spots that need attention..."
                  rows={3}
                  className="bg-background/50 border-border/50 text-sm resize-none"
                />
              </div>
              {isAdmin && (
                <Button onClick={saveProd} disabled={saving} className="w-full bg-primary text-primary-foreground h-10 rounded-xl font-semibold">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Production Notes</>}
                </Button>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}