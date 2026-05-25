import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertTriangle, CheckCircle2, Plus, Eye, EyeOff, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import ChartViewer from "./ChartViewer";

// ── Step 1: Paste ─────────────────────────────────────────────────────────────
function PasteStep({ onProcess, processing }) {
  const [text, setText] = useState('');

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
        <p className="text-[11px] text-primary/80 font-semibold leading-relaxed">
          Paste chord/lyric text from PNW Chords, a PDF, website, or notes. The AI will detect title, key, chords, sections, and language automatically.
        </p>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Paste your chart text here</Label>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={"[Verse 1]\nG      Em\nYou are here, moving in our midst\nC           D\nI worship You, I worship You\n\n[Chorus]\nG   D   Em  C\nWay Maker, Miracle Worker..."}
          rows={12}
          className="bg-background/60 border-white/10 text-sm font-mono leading-relaxed resize-y"
          autoFocus
        />
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Supports English, Malayalam Unicode, Manglish, and mixed charts.
        </p>
      </div>

      <Button
        onClick={() => onProcess(text)}
        disabled={processing || !text.trim()}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-semibold shadow-lg shadow-primary/20"
      >
        {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : <><ClipboardPaste className="w-4 h-4 mr-2" />Analyze & Import</>}
      </Button>
    </div>
  );
}

// ── Step 2: Processing ────────────────────────────────────────────────────────
function ProcessingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ClipboardPaste className="w-7 h-7 text-primary" />
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-background border border-white/10 flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-foreground">Analyzing chart...</p>
        <p className="text-xs text-muted-foreground mt-1">Detecting language, chords, and structure</p>
      </div>
    </div>
  );
}

// ── Step 3: Review ────────────────────────────────────────────────────────────
function ReviewStep({ extracted, onDataChange, onSaveNew, onSaveToExisting, onCancel, saving, existingSong }) {
  const [history, setHistory] = useState([extracted]);
  const [idx, setIdx] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const d = history[idx];

  const set = (k, v) => {
    const next = { ...d, [k]: v };
    const newHist = [...history.slice(0, idx + 1), next];
    setHistory(newHist);
    setIdx(newHist.length - 1);
    onDataChange(next);
  };
  const undo = () => { const i = idx - 1; setIdx(i); onDataChange(history[i]); };
  const redo = () => { const i = idx + 1; setIdx(i); onDataChange(history[i]); };
  const reset = () => { setHistory([extracted]); setIdx(0); onDataChange(extracted); };

  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold text-amber-300">Review before saving</p>
          <p className="text-[10px] text-amber-400/80 leading-relaxed mt-0.5">
            Check extracted content for accuracy, fix any errors, then save. This will be saved as "Needs Review".
          </p>
        </div>
      </div>

      {d.confidence_notes && (
        <div className="flex items-start gap-2 bg-white/4 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{d.confidence_notes}</p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Extracted Data — Edit as needed</p>
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={idx === 0} className="text-[11px] px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">↩ Undo</button>
            <button onClick={redo} disabled={idx === history.length - 1} className="text-[11px] px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">↪ Redo</button>
            <button onClick={reset} disabled={idx === 0} className="text-[11px] px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">↺ Reset</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
            <Input value={d.title || ''} onChange={e => set('title', e.target.value)}
              className="bg-background/60 border-white/10 text-sm h-9" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Artist</Label>
            <Input value={d.artist || ''} onChange={e => set('artist', e.target.value)}
              className="bg-background/60 border-white/10 text-sm h-9" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Key</Label>
            <Input value={d.key || ''} onChange={e => set('key', e.target.value)}
              className="bg-background/60 border-white/10 text-sm h-9 font-mono" placeholder="G" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">BPM</Label>
            <Input type="number" value={d.bpm || ''} onChange={e => set('bpm', e.target.value)}
              className="bg-background/60 border-white/10 text-sm h-9 font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Capo</Label>
            <Input type="number" value={d.capo || ''} onChange={e => set('capo', e.target.value)}
              className="bg-background/60 border-white/10 text-sm h-9 font-mono" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Language</Label>
          <select value={d.language || 'English'} onChange={e => set('language', e.target.value)}
            className="w-full bg-background/60 border border-white/10 text-foreground text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50">
            <option value="English">English</option>
            <option value="Malayalam">Malayalam</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-muted-foreground">Chart Content (chords + lyrics)</Label>
            <button onClick={() => setShowPreview(p => !p)}
              className="flex items-center gap-1 text-[11px] text-primary/80 hover:text-primary transition-colors">
              {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showPreview ? 'Hide Preview' : 'Preview Chart'}
            </button>
          </div>
          {showPreview && d.chart_content ? (
            <div className="mb-2">
              <ChartViewer song={d} />
            </div>
          ) : null}
          <Textarea value={d.chart_content || ''} onChange={e => set('chart_content', e.target.value)}
            rows={showPreview ? 6 : 10} className="bg-background/60 border-white/10 text-sm font-mono leading-relaxed resize-y" />
        </div>

        {(d.language === 'Malayalam' || d.malayalam_lyrics) && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block" style={{ fontFamily: 'system-ui' }}>Malayalam Lyrics (മലയാളം)</Label>
            <Textarea value={d.malayalam_lyrics || ''} onChange={e => set('malayalam_lyrics', e.target.value)}
              rows={5} className="bg-background/60 border-white/10 text-sm leading-relaxed resize-y"
              style={{ fontFamily: 'system-ui, sans-serif' }} />
          </div>
        )}

        {d.transliteration_lyrics && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Transliteration Lyrics</Label>
            <Textarea value={d.transliteration_lyrics || ''} onChange={e => set('transliteration_lyrics', e.target.value)}
              rows={5} className="bg-background/60 border-white/10 text-sm leading-relaxed resize-y" />
          </div>
        )}
      </div>

      {/* Source badge */}
      <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
        <span className="text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded px-2 py-0.5 uppercase tracking-wide">Paste Import</span>
        <p className="text-[11px] text-muted-foreground">Will be saved as <span className="text-amber-400 font-bold">Needs Review</span> · Not verified</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground text-sm h-9">Cancel</Button>
        <div className="flex-1" />
        {existingSong?.id && (
          <Button onClick={onSaveToExisting} disabled={saving}
            className="bg-secondary text-foreground border border-white/10 hover:bg-secondary/80 h-9 text-sm font-semibold">
            {saving === 'existing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save to Existing Song'}
          </Button>
        )}
        <Button onClick={onSaveNew} disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-semibold shadow-lg shadow-primary/20">
          {saving === 'new' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-3.5 h-3.5 mr-1" />Create New Song</>}
        </Button>
      </div>
    </div>
  );
}

// ── Parse pasted chart text into structured data via AI ──────────────────────
async function analyzeChartText(text) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a worship chart parser. Parse the following pasted chord/lyric text into structured data.

LANGUAGE DETECTION:
- "English": standard English lyrics
- "Malayalam": Malayalam Unicode script (ക, ത, etc.)
- "Manglish": Malayalam words in English phonetics (e.g. "Njan ninne sthuthikkum")
- "Mixed": contains both English and Malayalam/Manglish

The input text may already have inline chord lines (chords on one line, lyrics on the next), or chords inline with lyrics using brackets like [G] or (G).

Extract:
- title: from a header at the top, or null
- artist: if mentioned, or null
- key: if indicated (e.g. "Key: G" or "Capo 2"), or null
- bpm: if mentioned, or null
- capo: if mentioned, or null
- time_signature: if mentioned, or null
- language: "English" or "Malayalam"
- detected_language_type: "English", "Malayalam", "Manglish", or "Mixed"
- chart_content: cleaned chord+lyric chart text preserving section headers in [SectionName] format, chord lines above lyric lines, with no duplicate or garbled data. Clean spacing without destroying chord alignment.
- lyrics: plain lyrics only (no chords), sections separated by blank lines
- malayalam_lyrics: if Manglish or Malayalam detected, convert/preserve to Unicode; else empty string
- transliteration_lyrics: if Manglish, keep original Manglish as transliteration; else empty string
- confidence_notes: any notes about parsing uncertainty

Input text:
${text}`,
    response_json_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        artist: { type: "string" },
        key: { type: "string" },
        bpm: { type: "number" },
        capo: { type: "number" },
        time_signature: { type: "string" },
        language: { type: "string" },
        detected_language_type: { type: "string" },
        chart_content: { type: "string" },
        lyrics: { type: "string" },
        malayalam_lyrics: { type: "string" },
        transliteration_lyrics: { type: "string" },
        confidence_notes: { type: "string" }
      }
    }
  });
  return res;
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function PasteChartModal({ onClose, onSaved, existingSong, churchId }) {
  const [step, setStep] = useState('paste');
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  const handleProcess = useCallback(async (text) => {
    if (!text.trim()) return;
    setProcessing(true);
    setError(null);
    setStep('processing');
    try {
      const data = await analyzeChartText(text);
      if (!data) throw new Error('Analysis returned no data');
      data.verified_status = 'Needs Review';
      data.source_type = 'Paste Import';
      data.source_notes = `Paste Import · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}${data.confidence_notes ? '\n' + data.confidence_notes : ''}`;
      data.import_date = new Date().toISOString();
      setExtracted(data);
      setReviewData(data);
      setStep('review');
    } catch (e) {
      setError(e.message || 'Analysis failed. Please try again.');
      setStep('paste');
    } finally {
      setProcessing(false);
    }
  }, []);

  const buildPayload = (data) => ({
    title: data.title || 'Untitled (Paste Import)',
    artist: data.artist || '',
    key: data.key || '',
    bpm: data.bpm ? Number(data.bpm) : undefined,
    capo: data.capo ? Number(data.capo) : undefined,
    time_signature: data.time_signature || '',
    language: data.language || 'English',
    chart_content: data.chart_content || '',
    malayalam_lyrics: data.malayalam_lyrics || '',
    transliteration_lyrics: data.transliteration_lyrics || '',
    lyrics: data.lyrics || '',
    source_notes: data.source_notes || '',
    verified_status: 'Needs Review',
    tags: ['paste-import'],
    church_id: churchId,
  });

  const handleSaveNew = async () => {
    setSaving('new');
    try {
      await base44.entities.Song.create(buildPayload(reviewData));
      setStep('done');
      onSaved?.('new');
    } catch (e) {
      setError('Save failed: ' + e.message);
    } finally { setSaving(null); }
  };

  const handleSaveToExisting = async () => {
    if (!existingSong?.id) { handleSaveNew(); return; }
    setSaving('existing');
    try {
      const payload = buildPayload(reviewData);
      if (existingSong.verified_status === 'Verified' && existingSong.chart_content) {
        if (!window.confirm('This song already has a Verified chart. Overwrite it with the pasted import?')) {
          setSaving(null); return;
        }
      }
      await base44.entities.Song.update(existingSong.id, { ...payload, church_id: undefined });
      setStep('done');
      onSaved?.('existing');
    } catch (e) {
      setError('Save failed: ' + e.message);
    } finally { setSaving(null); }
  };

  const stepLabels = [
    ['paste', '1', 'Paste'],
    ['processing', '2', 'Analyze'],
    ['review', '3', 'Review'],
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[#14141f] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[95vh] sm:max-h-[88vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {step === 'done' ? 'Import Complete' : 'Paste Chart'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 'paste' && 'Paste chord/lyric text to import'}
                {step === 'processing' && 'AI is analyzing your chart...'}
                {step === 'review' && 'Review and edit before saving'}
                {step === 'done' && 'Chart saved successfully'}
              </p>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress steps */}
          {step !== 'done' && (
            <div className="flex items-center gap-1.5 px-5 pb-3 shrink-0">
              {stepLabels.map(([s, n, label], i) => {
                const stepOrder = ['paste', 'processing', 'review'];
                const currentIdx = stepOrder.indexOf(step);
                const thisIdx = stepOrder.indexOf(s);
                const isDone = currentIdx > thisIdx;
                const isActive = step === s;
                return (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                      isActive ? 'bg-primary text-primary-foreground border-primary' :
                      isDone ? 'bg-accent/20 text-accent border-accent/30' :
                      'bg-white/5 text-muted-foreground border-white/10'
                    }`}>
                      {isDone ? '✓' : n}
                    </div>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                    {i < stepLabels.length - 1 && <div className="w-6 h-px bg-white/10 mx-0.5" />}
                  </div>
                );
              })}
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-5 shrink-0" />

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {error && (
              <div className="flex items-start gap-2 bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive leading-relaxed">{error}</p>
              </div>
            )}

            {step === 'paste' && <PasteStep onProcess={handleProcess} processing={processing} />}
            {step === 'processing' && <ProcessingStep />}
            {step === 'review' && extracted && (
              <ReviewStep
                extracted={extracted}
                onDataChange={setReviewData}
                onSaveNew={handleSaveNew}
                onSaveToExisting={handleSaveToExisting}
                onCancel={onClose}
                saving={saving}
                existingSong={existingSong}
              />
            )}
            {step === 'done' && (
              <div className="flex flex-col items-center justify-center py-14 gap-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Chart imported successfully!</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[240px]">
                    Saved as <span className="text-amber-400 font-bold">Needs Review</span>. Open the song to verify and finalize the chart.
                  </p>
                </div>
                <Button onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Done
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}