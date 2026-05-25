import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Loader2, ScanLine } from "lucide-react";
const ChartBuilderModal = lazy(() => import("./ChartBuilderModal"));
const OCRImportModal = lazy(() => import("./OCRImportModal"));
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import ChartViewer from "./ChartViewer";

const SongEntity = base44.entities.Song;

const ARRANGEMENT_SECTIONS = ['Intro', 'V1', 'Pre-Ch', 'Chorus', 'V2', 'Bridge', 'V3', 'Tag', 'Outro'];

const TABS = [
  { id: 'details', label: 'Details', icon: null },
  { id: 'malayalam', label: 'മലയാളം', icon: '🕊' },
  { id: 'chart', label: 'Chart', icon: '📄' },
  { id: 'lyrics', label: 'Lyrics', icon: '🎵' },
  { id: 'patches', label: 'Patches', icon: '🎛' },
  { id: 'prod', label: 'Prod', icon: '🎬' },
];

export default function SongDetailModal({ song, onClose, onSave, churchId }) {
  const isNew = !song?.id;
  const [tab, setTab] = useState('details');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [arrangementSections, setArrangementSections] = useState(song?.arrangement_sections || []);
  const [customSection, setCustomSection] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showChartBuilder, setShowChartBuilder] = useState(false);
  const [showOCR, setShowOCR] = useState(false);

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
    lyrics: song?.lyrics || '',
    language: song?.language || 'English',
    malayalam_title: song?.malayalam_title || '',
    transliteration_title: song?.transliteration_title || '',
    malayalam_lyrics: song?.malayalam_lyrics || '',
    transliteration_lyrics: song?.transliteration_lyrics || '',
    source_notes: song?.source_notes || '',
    verified_status: song?.verified_status || 'Unverified',
    verified_by: song?.verified_by || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    try {
      const payload = {
        ...form,
        church_id: churchId,
        arrangement_sections: arrangementSections,
        bpm: form.bpm !== "" && form.bpm !== null && form.bpm !== undefined ? Number(form.bpm) : undefined,
        capo: form.capo !== "" && form.capo !== null && form.capo !== undefined ? Number(form.capo) : undefined,
      };
      if (song?.id) await SongEntity.update(song.id, payload);
      else await SongEntity.create(payload);
      onSave();
    } catch {
      setSaveError("Save failed. Please try again.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!song?.id) return;
    setDeleting(true); setSaveError(null);
    try {
      await SongEntity.delete(song.id);
      onSave();
    } catch {
      setSaveError("Delete failed. Please try again.");
    } finally { setDeleting(false); }
  };

  const toggleSection = (s) => {
    setArrangementSections(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const addCustomSection = () => {
    const s = customSection.trim();
    if (s && !arrangementSections.includes(s)) {
      setArrangementSections(prev => [...prev, s]);
    }
    setCustomSection('');
    setShowAddSection(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
          className="relative bg-[#18182a] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-2 shrink-0">
            <div>
              <h2 className="text-base font-bold text-foreground">{form.title || 'New Song'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{form.artist}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isNew && (
                <button className="text-[11px] font-semibold text-foreground bg-secondary/60 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors whitespace-nowrap">
                  Add to My Library
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-7 h-7 rounded-full bg-secondary/60 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-1.5 px-6 pb-2 overflow-x-auto scrollbar-hide shrink-0">
            {form.key && (
              <span className="text-[11px] font-bold bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1 whitespace-nowrap">
                Key: {form.key}
              </span>
            )}
            {form.bpm && (
              <span className="text-[11px] font-semibold bg-secondary/60 text-muted-foreground border border-white/10 rounded-full px-3 py-1 whitespace-nowrap">
                {form.bpm} BPM
              </span>
            )}
            {form.time_signature && (
              <span className="text-[11px] font-semibold bg-secondary/60 text-muted-foreground border border-white/10 rounded-full px-3 py-1 whitespace-nowrap">
                {form.time_signature}
              </span>
            )}
            {Number(form.capo) > 0 && (
              <span className="text-[11px] font-semibold bg-secondary/60 text-muted-foreground border border-white/10 rounded-full px-3 py-1 whitespace-nowrap">
                Capo {form.capo}
              </span>
            )}
            {form.chart_content && (
              <span
                onClick={() => setTab('chart')}
                className="text-[11px] font-semibold bg-secondary/60 text-muted-foreground border border-white/10 rounded-full px-3 py-1 whitespace-nowrap cursor-pointer hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Chart
              </span>
            )}
          </div>

          {/* Gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-6 shrink-0" />

          {/* Arrangement Sections */}
          <div className="px-6 pt-3 pb-2 shrink-0">
            <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-2">Arrangement Sections</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {ARRANGEMENT_SECTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSection(s)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
                    arrangementSections.includes(s)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-secondary/40 text-muted-foreground border-white/10 hover:border-white/30 hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
              {/* Custom sections added by user */}
              {arrangementSections.filter(s => !ARRANGEMENT_SECTIONS.includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => toggleSection(s)}
                  className="text-[11px] font-bold px-3 py-1 rounded-full border bg-primary text-primary-foreground border-primary shadow-sm transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {showAddSection ? (
                <>
                  <input
                    autoFocus
                    value={customSection}
                    onChange={e => setCustomSection(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomSection()}
                    placeholder="Section name..."
                    className="bg-background/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground outline-none focus:border-primary/50 w-32"
                  />
                  <button onClick={addCustomSection} className="text-[11px] font-bold text-primary hover:text-primary/80">+ Add</button>
                  <button onClick={() => setShowAddSection(false)} className="text-[11px] text-muted-foreground hover:text-foreground">Cancel</button>
                </>
              ) : (
                <button
                  onClick={() => setShowAddSection(true)}
                  className="text-[11px] text-muted-foreground border border-white/10 rounded-lg px-3 py-1 hover:border-white/30 hover:text-foreground transition-colors"
                >
                  Add section...
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 px-2 pt-1 pb-0 shrink-0 border-b border-white/10 overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap flex-shrink-0 ${
                  tab === t.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon ? `${t.icon} ${t.label}` : t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                {tab === 'details' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
                        <Input value={form.title} onChange={e => set('title', e.target.value)}
                          className="bg-background/60 border-white/10 text-sm h-10" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Artist</Label>
                        <Input value={form.artist} onChange={e => set('artist', e.target.value)}
                          className="bg-background/60 border-white/10 text-sm h-10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Key</Label>
                        <Input value={form.key} onChange={e => set('key', e.target.value)}
                          placeholder="G, A, F#…" className="bg-background/60 border-white/10 text-sm h-10 font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">BPM</Label>
                        <Input type="number" value={form.bpm} onChange={e => set('bpm', e.target.value)}
                          className="bg-background/60 border-white/10 text-sm h-10 font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Time Sig</Label>
                        <Input value={form.time_signature} onChange={e => set('time_signature', e.target.value)}
                          className="bg-background/60 border-white/10 text-sm h-10 font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Capo</Label>
                        <Input type="number" value={form.capo} onChange={e => set('capo', e.target.value)}
                          className="bg-background/60 border-white/10 text-sm h-10 font-mono" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">YouTube / Reference</Label>
                      <Input value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)}
                        placeholder="https://youtube.com/..." type="url" className="bg-background/60 border-white/10 text-sm h-10" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Tags (comma separated)</Label>
                      <Input value={(form.tags || []).join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        placeholder="worship, contemporary, anthem…" className="bg-background/60 border-white/10 text-sm h-10" />
                    </div>

                    {/* Open Chart Builder CTA */}
                    <button
                      onClick={() => { setTab('chart'); setTimeout(() => setShowChartBuilder(true), 100); }}
                      className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 hover:bg-primary/20 transition-colors w-full justify-center mt-1"
                    >
                      📄 Open Chart Builder →
                    </button>
                  </div>
                )}

                {tab === 'chart' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Chart preview</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowOCR(true)}
                          className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-white/8 border border-white/15 rounded-lg px-3 py-1.5 hover:bg-white/12 transition-colors"
                        >
                          <ScanLine className="w-3.5 h-3.5" /> Scan Chart
                        </button>
                        <button
                          onClick={() => setShowChartBuilder(true)}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors"
                        >
                          Full Editor
                        </button>
                      </div>
                    </div>
                    {form.chart_content ? (
                      <ChartViewer song={{ ...song, ...form }} />
                    ) : (
                      <div className="bg-background/40 border border-white/10 rounded-xl p-4 text-center text-muted-foreground text-sm">
                        No chart yet. Use the Full Editor to add one.
                      </div>
                    )}
                    <div className="pt-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Quick Edit</p>
                      <Textarea value={form.chart_content} onChange={e => set('chart_content', e.target.value)}
                        placeholder="[Verse 1]&#10;G      Em&#10;You are here, moving in our midst&#10;C      D&#10;I worship You&#10;&#10;[Chorus]&#10;G   D   Em  C&#10;Way Maker..."
                        rows={10}
                        className="bg-background/60 border-white/10 text-sm font-mono leading-relaxed resize-y" />
                    </div>
                  </div>
                )}

                {tab === 'malayalam' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Language</Label>
                      <select value={form.language} onChange={e => set('language', e.target.value)} className="w-full bg-background/60 border border-white/10 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="English">English</option>
                        <option value="Malayalam">Malayalam</option>

                      </select>
                    </div>
                    {form.language === 'Malayalam' && (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Malayalam Title (Unicode)</Label>
                          <Input value={form.malayalam_title} onChange={e => set('malayalam_title', e.target.value)}
                            placeholder="e.g. മാഞ്ഞുപോകാത്ത സ്നേഹം"
                            className="bg-background/60 border-white/10 text-sm h-10" style={{ fontFamily: 'system-ui, sans-serif' }} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Transliteration Title (English phonetic)</Label>
                          <Input value={form.transliteration_title} onChange={e => set('transliteration_title', e.target.value)}
                            placeholder="e.g. Manjupokatha Sneham"
                            className="bg-background/60 border-white/10 text-sm h-10" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Malayalam Lyrics (Unicode)</Label>
                          <Textarea value={form.malayalam_lyrics} onChange={e => set('malayalam_lyrics', e.target.value)}
                            placeholder={"[Verse 1]\nമഞ്ഞുതുള്ളി..."}
                            rows={8}
                            className="bg-background/60 border-white/10 text-sm leading-relaxed resize-y" style={{ fontFamily: 'system-ui, sans-serif' }} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Transliteration Lyrics</Label>
                          <Textarea value={form.transliteration_lyrics} onChange={e => set('transliteration_lyrics', e.target.value)}
                            placeholder={"[Verse 1]\nManjuthully..."}
                            rows={8}
                            className="bg-background/60 border-white/10 text-sm leading-relaxed resize-y" />
                        </div>
                      </>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Source Notes</Label>
                      <Textarea value={form.source_notes} onChange={e => set('source_notes', e.target.value)}
                        placeholder="Album, composer, CCLI number, license info..."
                        rows={3}
                        className="bg-background/60 border-white/10 text-sm resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Verified Status</Label>
                        <select value={form.verified_status} onChange={e => set('verified_status', e.target.value)} className="w-full bg-background/60 border border-white/10 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50">
                          <option value="Unverified">Unverified</option>
                          <option value="Needs Review">Needs Review</option>
                          <option value="Verified">Verified</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Verified By</Label>
                        <Input value={form.verified_by} onChange={e => set('verified_by', e.target.value)}
                          placeholder="Name or email"
                          className="bg-background/60 border-white/10 text-sm h-10" />
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'lyrics' && (
                  <div className="space-y-3">
                    <div className="bg-secondary/20 border border-border/30 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">About Lyrics</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Paste song lyrics here for easy reference during rehearsal. Spotify does not provide licensed lyrics through their API — use this field to manually add lyrics from a licensed source (e.g. official sheet music, CCLI licensed copy).
                      </p>
                    </div>
                    {form.spotify_url && (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                        <span className="text-green-400 text-xs">🎵</span>
                        <p className="text-[11px] text-green-400 font-medium flex-1">Spotify metadata imported · Lyrics not included (not available via API)</p>
                        <a href={form.spotify_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-400 underline font-semibold shrink-0">Open ↗</a>
                      </div>
                    )}
                    <Textarea
                      value={form.lyrics}
                      onChange={e => set('lyrics', e.target.value)}
                      placeholder={"Verse 1:\nPaste lyrics here from your licensed source (CCLI, official sheet music, etc.)\n\nChorus:\n..."}
                      rows={16}
                      className="bg-background/60 border-white/10 text-sm leading-relaxed resize-y font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">Only use lyrics you have a legal right to reproduce (CCLI license, purchased sheet music, etc.).</p>
                  </div>
                )}

                {tab === 'patches' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Guitar Patch Notes</Label>
                      <Textarea value={form.guitar_patch_notes} onChange={e => set('guitar_patch_notes', e.target.value)}
                        placeholder="e.g. Clean chorus, shimmer reverb, dotted-8th delay at 480ms…"
                        rows={5} className="bg-background/60 border-white/10 text-sm resize-none" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Keys / Piano</Label>
                      <Textarea value={form.keys_patch_notes} onChange={e => set('keys_patch_notes', e.target.value)}
                        placeholder="e.g. Piano + analog pad. Strings layer on chorus…"
                        rows={5} className="bg-background/60 border-white/10 text-sm resize-none" />
                    </div>
                  </div>
                )}

                {tab === 'prod' && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Production Notes</Label>
                    <Textarea value={form.production_notes} onChange={e => set('production_notes', e.target.value)}
                      placeholder="Lighting cues, video content, stage plot, monitor mix notes…"
                      rows={12} className="bg-background/60 border-white/10 text-sm resize-none" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error banner */}
          {saveError && (
            <div className="mx-6 mb-2 px-3 py-2 bg-destructive/15 border border-destructive/30 rounded-lg text-xs text-destructive font-medium">
              {saveError}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 shrink-0">
            {song?.id && (
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white h-9 text-sm"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete</>}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground h-9 text-sm">Cancel</Button>
            <Button onClick={handleSave} disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 font-semibold text-sm shadow-lg shadow-primary/20">
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
      {showOCR && (
        <Suspense fallback={null}>
          <OCRImportModal
            existingSong={{ ...song, ...form }}
            churchId={churchId}
            onClose={() => setShowOCR(false)}
            onSaved={(type) => {
              setShowOCR(false);
              if (type === 'existing') onSave();
            }}
          />
        </Suspense>
      )}
    </AnimatePresence>
  );
}