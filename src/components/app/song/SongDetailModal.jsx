import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Save, Trash2, Loader2, Music, Youtube, Wrench } from "lucide-react";
const ChartBuilderModal = lazy(() => import("./ChartBuilderModal"));
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import ChartViewer from "./ChartViewer";

const SongEntity = base44.entities.Song;

const ARRANGEMENT_SECTIONS = ['Intro', 'V1', 'V2', 'Pre-Ch', 'Chorus', 'V3', 'Bridge', 'Tag', 'Outro'];

function ArtworkImage({ song }) {
  const [error, setError] = useState(false);
  if (song?.artwork_url && !error) {
    return (
      <img
        src={song.artwork_url}
        alt={song.title}
        onError={() => setError(true)}
        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-lg border border-border/30"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      <Music className="w-5 h-5 text-primary" />
    </div>
  );
}

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'chart', label: '📄 Chart' },
  { id: 'patches', label: '🎭 Patches' },
  { id: 'prod', label: '🎬 Prod' },
];

export default function SongDetailModal({ song, onClose, onSave, churchId }) {
  const isNew = !song?.id;
  const [tab, setTab] = useState('details');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [arrangementSections, setArrangementSections] = useState(
    song?.arrangement_sections || []
  );

  const [form, setForm] = useState({
    title: song?.title || '',
    artist: song?.artist || '',
    key: song?.key || '',
    bpm: song?.bpm || '',
    time_signature: song?.time_signature || '4/4',
    capo: song?.capo || 0,
    youtube_url: song?.youtube_url || '',
    chart_content: song?.chart_content || '',
    guitar_patch_notes: song?.guitar_patch_notes || '',
    keys_patch_notes: song?.keys_patch_notes || '',
    production_notes: song?.production_notes || '',
    arrangement_notes: song?.arrangement_notes || '',
    is_favorite: song?.is_favorite || false,
    category: song?.category || '',
    tags: song?.tags || [],
    artwork_url: song?.artwork_url || '',
    spotify_url: song?.spotify_url || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [showChartBuilder, setShowChartBuilder] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, church_id: churchId };
      if (song?.id) await SongEntity.update(song.id, payload);
      else await SongEntity.create(payload);
      onSave();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!song?.id) return;
    setDeleting(true);
    try {
      await SongEntity.delete(song.id);
      onSave();
    } finally { setDeleting(false); }
  };

  const toggleSection = (s) => {
    setArrangementSections(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
          className="relative bg-[#1a1a2e] border border-border/40 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
            <ArtworkImage song={isNew ? form : song} />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground truncate">
                {form.title || 'New Song'}
              </h2>
              <p className="text-xs text-muted-foreground truncate">{form.artist}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => set('is_favorite', !form.is_favorite)}
                className="text-xs text-muted-foreground hover:text-yellow-400 transition-colors"
                title="Favorite"
              >
                <Star className={`w-4 h-4 ${form.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide shrink-0">
            {form.key && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1 whitespace-nowrap">
                Key: {form.key}
              </span>
            )}
            {form.bpm && (
              <span className="text-[11px] font-bold bg-secondary text-muted-foreground border border-border/40 rounded-full px-3 py-1 whitespace-nowrap">
                {form.bpm} BPM
              </span>
            )}
            {form.time_signature && (
              <span className="text-[11px] font-bold bg-secondary text-muted-foreground border border-border/40 rounded-full px-3 py-1 whitespace-nowrap">
                {form.time_signature}
              </span>
            )}
            {form.capo > 0 && (
              <span className="text-[11px] font-bold bg-secondary text-muted-foreground border border-border/40 rounded-full px-3 py-1 whitespace-nowrap">
                Capo {form.capo}
              </span>
            )}
            {form.chart_content && (
              <span className="text-[11px] font-bold bg-secondary text-muted-foreground border border-border/40 rounded-full px-3 py-1 whitespace-nowrap cursor-pointer hover:border-primary/30 hover:text-foreground transition-colors"
                onClick={() => setTab('chart')}>
                Chart
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-5 shrink-0" />

          {/* Arrangement sections */}
          <div className="px-5 pt-3 pb-2 shrink-0">
            <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-2">Arrangement Sections</p>
            <div className="flex flex-wrap gap-1.5">
              {ARRANGEMENT_SECTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSection(s)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
                    arrangementSections.includes(s)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                      : 'bg-secondary/40 text-muted-foreground border-border/30 hover:border-border hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 pt-1 pb-2 shrink-0 border-b border-border/30">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                {tab === 'details' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">Title</Label>
                        <Input value={form.title} onChange={e => set('title', e.target.value)}
                          className="bg-background/60 border-border/40 text-sm h-10" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">Artist</Label>
                        <Input value={form.artist} onChange={e => set('artist', e.target.value)}
                          className="bg-background/60 border-border/40 text-sm h-10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">Key</Label>
                        <Input value={form.key} onChange={e => set('key', e.target.value)}
                          placeholder="G, A, F#…" className="bg-background/60 border-border/40 text-sm h-10 font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">BPM</Label>
                        <Input type="number" value={form.bpm} onChange={e => set('bpm', e.target.value)}
                          className="bg-background/60 border-border/40 text-sm h-10 font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">Capo</Label>
                        <Input type="number" value={form.capo} onChange={e => set('capo', e.target.value)}
                          className="bg-background/60 border-border/40 text-sm h-10 font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">Time Sig</Label>
                        <Input value={form.time_signature} onChange={e => set('time_signature', e.target.value)}
                          className="bg-background/60 border-border/40 text-sm h-10 font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">Category</Label>
                        <Input value={form.category} onChange={e => set('category', e.target.value)}
                          placeholder="Worship, Hymn…" className="bg-background/60 border-border/40 text-sm h-10" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">YouTube / Reference</Label>
                      <Input value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)}
                        placeholder="https://youtube.com/..." type="url" className="bg-background/60 border-border/40 text-sm h-10" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground ml-0.5 mb-1 block">Tags (comma separated)</Label>
                      <Input value={(form.tags || []).join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        placeholder="worship, contemporary, anthem…" className="bg-background/60 border-border/40 text-sm h-10" />
                    </div>
                    {song?.youtube_url && (
                      <a href={song.youtube_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-semibold bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 transition-colors">
                        <Youtube className="w-3.5 h-3.5" /> Open on YouTube
                      </a>
                    )}
                  </div>
                )}

                {tab === 'chart' && (
                <div className="space-y-3">
                {/* Live preview for existing charts */}
                {form.chart_content && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Chart Preview</p>
                      <button
                        onClick={() => setShowChartBuilder(true)}
                        className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 hover:bg-primary/20 transition-colors"
                      >
                        <Wrench className="w-3 h-3" /> Open Chart Builder →
                      </button>
                    </div>
                    <ChartViewer song={{ ...song, ...form }} />
                  </div>
                )}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Edit Chart</p>
                      <p className="text-[11px] text-muted-foreground mb-2 bg-secondary/30 rounded-lg p-2 border border-border/30">
                        <span className="text-foreground font-semibold">[Verse 1]</span> = section header &nbsp;·&nbsp;
                        <span className="text-foreground font-semibold font-mono">G Em C D</span> = chord line &nbsp;·&nbsp;
                        Lyrics on the next line
                      </p>
                      <Textarea value={form.chart_content} onChange={e => set('chart_content', e.target.value)}
                        placeholder="[Verse 1]&#10;G      Em&#10;You are here, moving in our midst&#10;C      D&#10;I worship You&#10;&#10;[Chorus]&#10;G   D   Em  C&#10;Way Maker, Miracle Worker..."
                        rows={12}
                        className="bg-background/60 border-border/40 text-sm font-mono leading-relaxed resize-y" />
                    </div>
                  </div>
                )}

                {tab === 'patches' && (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🎸</span>
                        <Label className="text-xs font-bold text-foreground">Guitar Patch Notes</Label>
                      </div>
                      <Textarea value={form.guitar_patch_notes} onChange={e => set('guitar_patch_notes', e.target.value)}
                        placeholder="e.g. Clean chorus, shimmer reverb, dotted-8th delay at 480ms. Edge of breakup on pre-amp…"
                        rows={5} className="bg-background/60 border-border/40 text-sm resize-none" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🎹</span>
                        <Label className="text-xs font-bold text-foreground">Keys / Piano</Label>
                      </div>
                      <Textarea value={form.keys_patch_notes} onChange={e => set('keys_patch_notes', e.target.value)}
                        placeholder="e.g. Piano + analog pad. Strings layer on chorus. Soft attack, filter swell into bridge…"
                        rows={5} className="bg-background/60 border-border/40 text-sm resize-none" />
                    </div>
                  </div>
                )}

                {tab === 'prod' && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">🎬</span>
                      <Label className="text-xs font-bold text-foreground">Production Notes</Label>
                    </div>
                    <Textarea value={form.production_notes} onChange={e => set('production_notes', e.target.value)}
                      placeholder="Lighting cues, video content, stage plot, monitor mix notes, sound notes…"
                      rows={12} className="bg-background/60 border-border/40 text-sm resize-none" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border/30 bg-background/30 shrink-0">
            {song?.id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white h-9"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete</>}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground h-9">Cancel</Button>
            <Button onClick={handleSave} disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6 font-semibold shadow-lg shadow-primary/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Save</>}
            </Button>
          </div>
        </motion.div>
      </div>

      {showChartBuilder && (
        <Suspense fallback={null}>
          <ChartBuilderModal
            song={{ ...song, ...form }}
            onClose={() => setShowChartBuilder(false)}
            onSave={(newChart) => { set('chart_content', newChart); setShowChartBuilder(false); }}
          />
        </Suspense>
      )}
    </AnimatePresence>
  );
}