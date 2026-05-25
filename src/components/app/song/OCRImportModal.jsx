import { useState, useRef, useCallback, lazy, Suspense } from "react";
const CameraCapture = lazy(() => import("./CameraCapture"));
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, FileImage, AlertTriangle, CheckCircle2, Save, Plus, FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { ocrChartImport } from "@/functions/ocrChartImport";

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,image/heic,application/pdf";

// ── Step 1: Upload ────────────────────────────────────────────────────────────
function UploadStep({ onFileSelected, uploading }) {
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onFileSelected(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
        <p className="text-[11px] text-primary/80 font-semibold leading-relaxed">
          Upload a photo, screenshot, or scan of a worship chart. The AI will extract chords, lyrics, section headers, and Malayalam content automatically.
        </p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
          dragging ? "border-primary bg-primary/10" : "border-white/15 hover:border-primary/50 hover:bg-white/3"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileImage className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">Drop your chart scan here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse · JPG, PNG, WEBP, PDF</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Camera Photo', 'Screenshot', 'PDF', 'Scanned Paper'].map(t => (
                <span key={t} className="text-[10px] bg-white/5 border border-white/10 rounded-full px-3 py-1 text-muted-foreground">{t}</span>
              ))}
            </div>
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
        onChange={e => handleFile(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />

      <Button
        type="button"
        variant="outline"
        onClick={() => setShowCamera(true)}
        disabled={uploading}
        className="w-full border-white/15 text-muted-foreground hover:text-foreground hover:border-primary/50 h-10"
      >
        <Camera className="w-4 h-4 mr-2" /> Take Photo with Camera
      </Button>

      {showCamera && (
        <Suspense fallback={null}>
          <CameraCapture
            onCapture={(file) => { setShowCamera(false); onFileSelected(file); }}
            onClose={() => setShowCamera(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

// ── Step 2: Processing ────────────────────────────────────────────────────────
function ProcessingStep({ fileName }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <FileText className="w-9 h-9 text-primary" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-foreground">Scanning chart...</p>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-[240px] leading-relaxed">
          AI is extracting chords, lyrics, section headers, and Malayalam content from your upload.
        </p>
        {fileName && <p className="text-[10px] text-muted-foreground/60 mt-2 truncate max-w-[200px]">{fileName}</p>}
      </div>
      <div className="flex flex-col gap-2 w-full max-w-[240px]">
        {["Analyzing image structure...", "Detecting chord lines...", "Extracting lyrics & sections...", "Processing Malayalam content..."].map((s, i) => (
          <motion.div key={s}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.5 }}
            className="flex items-center gap-2 text-[11px] text-muted-foreground"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            {s}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Step 3: Review ────────────────────────────────────────────────────────────
function ReviewStep({ fileUrl, extracted, onDataChange, onSaveNew, onSaveToExisting, onCancel, saving }) {
  const [d, setD] = useState(extracted);
  const set = (k, v) => { const next = { ...d, [k]: v }; setD(next); onDataChange(next); };

  const hasConfidenceWarning = !!d.confidence_notes;

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold text-amber-300">Review before saving</p>
          <p className="text-[10px] text-amber-400/80 leading-relaxed mt-0.5">
            OCR results are not perfect. Review all extracted content, fix any errors, then save. This will be saved as "Needs Review" — not Verified.
          </p>
        </div>
      </div>

      {/* Confidence notes */}
      {hasConfidenceWarning && (
        <div className="flex items-start gap-2 bg-white/4 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{d.confidence_notes}</p>
        </div>
      )}

      {/* Side by side: preview + edit */}
      <div className="grid grid-cols-1 gap-4">
        {/* Original scan preview */}
        {fileUrl && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">Original Scan</p>
            <div className="bg-black/40 border border-white/8 rounded-xl overflow-hidden max-h-48">
              <img src={fileUrl} alt="Uploaded scan" className="w-full object-contain max-h-48" />
            </div>
          </div>
        )}

        {/* Editable fields */}
        <div className="space-y-3">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Extracted Data — Edit as needed</p>

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
            <Label className="text-xs text-muted-foreground mb-1 block">Chart Content (chords + lyrics)</Label>
            <Textarea value={d.chart_content || ''} onChange={e => set('chart_content', e.target.value)}
              rows={10} className="bg-background/60 border-white/10 text-sm font-mono leading-relaxed resize-y" />
          </div>

          {(d.language === 'Malayalam' || d.malayalam_lyrics) && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block" style={{ fontFamily: 'system-ui' }}>Malayalam Lyrics (മലയാളം)</Label>
              <Textarea value={d.malayalam_lyrics || ''} onChange={e => set('malayalam_lyrics', e.target.value)}
                rows={6} className="bg-background/60 border-white/10 text-sm leading-relaxed resize-y"
                style={{ fontFamily: 'system-ui, sans-serif' }} />
            </div>
          )}

          {d.transliteration_lyrics && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Transliteration Lyrics</Label>
              <Textarea value={d.transliteration_lyrics || ''} onChange={e => set('transliteration_lyrics', e.target.value)}
                rows={6} className="bg-background/60 border-white/10 text-sm leading-relaxed resize-y" />
            </div>
          )}
        </div>
      </div>

      {/* Source badge note */}
      <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
        <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded px-2 py-0.5 uppercase tracking-wide">OCR Import</span>
        <p className="text-[11px] text-muted-foreground">Will be saved as <span className="text-amber-400 font-bold">Needs Review</span> · Not verified</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground text-sm h-9">Cancel</Button>
        <div className="flex-1" />
        <Button onClick={onSaveToExisting} disabled={saving}
          className="bg-secondary text-foreground border border-white/10 hover:bg-secondary/80 h-9 text-sm font-semibold">
          {saving === 'existing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save to Existing Song'}
        </Button>
        <Button onClick={onSaveNew} disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-semibold shadow-lg shadow-primary/20">
          {saving === 'new' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-3.5 h-3.5 mr-1" />Create New Song</>}
        </Button>
      </div>
    </div>
  );
}

// ── Main OCR Import Modal ─────────────────────────────────────────────────────
export default function OCRImportModal({ onClose, onSaved, existingSong, churchId }) {
  const [step, setStep] = useState('upload'); // upload | processing | review | done
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = async (file) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
      setUploading(false);
      setStep('processing');

      const res = await ocrChartImport({ file_url });
      const data = res?.data?.data || res?.data;
      if (!data) throw new Error('OCR returned no data');

      // Always default to Needs Review
      data.verified_status = 'Needs Review';
      data.source_type = 'OCR Import';
      data.source_notes = (data.source_notes || '') + `\nOCR imported from: ${file.name}`;

      setExtracted(data);
      setReviewData(data);
      setStep('review');
    } catch (e) {
      setError(e.message || 'OCR processing failed. Please try again.');
      setStep('upload');
      setUploading(false);
    }
  };

  const buildPayload = (data) => ({
    title: data.title || 'Untitled (OCR Import)',
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
    tags: ['ocr-import'],
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
      // Don't overwrite verified charts
      if (existingSong.verified_status === 'Verified' && existingSong.chart_content) {
        if (!window.confirm('This song already has a Verified chart. Overwrite it with the OCR import?')) {
          setSaving(null); return;
        }
      }
      await base44.entities.Song.update(existingSong.id, {
        ...payload,
        church_id: undefined, // don't overwrite church_id
      });
      setStep('done');
      onSaved?.('existing');
    } catch (e) {
      setError('Save failed: ' + e.message);
    } finally { setSaving(null); }
  };

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
          {/* Top accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {step === 'done' ? 'Import Complete' : 'Scan Chart'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 'upload' && 'Upload a photo or scan of a worship chart'}
                {step === 'processing' && 'AI is extracting chart data...'}
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
              {[['upload', '1', 'Upload'], ['processing', '2', 'Scan'], ['review', '3', 'Review']].map(([s, n, label]) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                    step === s ? 'bg-primary text-primary-foreground border-primary' :
                    ['processing', 'review'].indexOf(step) > ['processing', 'review'].indexOf(s) || step === 'review' && s === 'upload' || step === 'review' && s === 'processing'
                      ? 'bg-accent/20 text-accent border-accent/30'
                      : 'bg-white/5 text-muted-foreground border-white/10'
                  }`}>
                    {(step === 'review' && (s === 'upload' || s === 'processing')) ? '✓' : n}
                  </div>
                  <span className={`text-[10px] font-semibold ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  {s !== 'review' && <div className="w-6 h-px bg-white/10 mx-0.5" />}
                </div>
              ))}
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

            {step === 'upload' && (
              <UploadStep onFileSelected={handleFileSelected} uploading={uploading} />
            )}
            {step === 'processing' && (
              <ProcessingStep fileName={fileName} />
            )}
            {step === 'review' && extracted && (
              <ReviewStep
                fileUrl={fileUrl}
                extracted={extracted}
                onDataChange={setReviewData}
                onSaveNew={handleSaveNew}
                onSaveToExisting={handleSaveToExisting}
                onCancel={onClose}
                saving={saving}
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