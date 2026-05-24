import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music } from "lucide-react";
import { transposeFullChart, chartToNashville, ALL_KEYS_SHARP, ALL_KEYS_FLAT, suggestCapo } from "./ChordTransposer";

// ── Chord extraction from chart ───────────────────────────────────────────────
const CHORD_REGEX = /\b([A-G][b#]?(?:maj7|maj|min7|m7|m|sus4|sus2|sus|add9|add2|dim7|dim|aug|7|9|11)?(?:\/[A-G][b#]?)?)\b/g;

function isChordLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('[')) return false;
  if (!/^[A-G]/.test(trimmed)) return false;
  const tokens = trimmed.split(/\s+/);
  const chordCount = tokens.filter(t => /^[A-G][b#]?/.test(t)).length;
  return chordCount >= tokens.length * 0.6 && tokens.length <= 10 && !/[,!?]/.test(trimmed);
}

function isSectionHeader(line) {
  return line.trim().startsWith('[');
}

function extractChordsFromChart(chartContent) {
  if (!chartContent) return [];
  const chords = new Set();
  chartContent.split('\n').forEach(line => {
    if (!isChordLine(line)) return;
    let match;
    const re = new RegExp(CHORD_REGEX.source, 'g');
    while ((match = re.exec(line)) !== null) {
      // Normalize: strip slash bass note for lookup
      const base = match[1].split('/')[0];
      chords.add(base);
    }
  });
  return Array.from(chords);
}

// ── Guitar chord database ─────────────────────────────────────────────────────
const GUITAR_CHORDS = {
  'C':    { frets: [-1,3,2,0,1,0], baseFret: 1, barre: null },
  'D':    { frets: [-1,-1,0,2,3,2], baseFret: 1, barre: null },
  'E':    { frets: [0,2,2,1,0,0], baseFret: 1, barre: null },
  'F':    { frets: [1,1,2,3,3,1], baseFret: 1, barre: 1 },
  'G':    { frets: [3,2,0,0,0,3], baseFret: 1, barre: null },
  'A':    { frets: [-1,0,2,2,2,0], baseFret: 1, barre: null },
  'B':    { frets: [-1,2,4,4,4,2], baseFret: 2, barre: 2 },
  'Em':   { frets: [0,2,2,0,0,0], baseFret: 1, barre: null },
  'Am':   { frets: [-1,0,2,2,1,0], baseFret: 1, barre: null },
  'Dm':   { frets: [-1,-1,0,2,3,1], baseFret: 1, barre: null },
  'Bm':   { frets: [-1,2,4,4,3,2], baseFret: 2, barre: 2 },
  'F#m':  { frets: [2,4,4,2,2,2], baseFret: 2, barre: 2 },
  'C#m':  { frets: [-1,4,6,6,5,4], baseFret: 4, barre: 4 },
  'G#m':  { frets: [4,6,6,4,4,4], baseFret: 4, barre: 4 },
  'Eb':   { frets: [-1,6,5,3,4,3], baseFret: 3, barre: 3 },
  'Bb':   { frets: [-1,1,3,3,3,1], baseFret: 1, barre: 1 },
  'Ab':   { frets: [4,6,6,5,4,4], baseFret: 4, barre: 4 },
  'F#':   { frets: [2,4,4,3,2,2], baseFret: 2, barre: 2 },
  'Gsus4':{ frets: [3,3,0,0,1,3], baseFret: 1, barre: null },
  'Dsus4':{ frets: [-1,-1,0,2,3,3], baseFret: 1, barre: null },
  'Asus2':{ frets: [-1,0,2,2,0,0], baseFret: 1, barre: null },
  'Asus4':{ frets: [-1,0,2,2,3,0], baseFret: 1, barre: null },
  'Esus4':{ frets: [0,2,2,2,0,0], baseFret: 1, barre: null },
  'G7':   { frets: [3,2,0,0,0,1], baseFret: 1, barre: null },
  'D7':   { frets: [-1,-1,0,2,1,2], baseFret: 1, barre: null },
  'E7':   { frets: [0,2,0,1,0,0], baseFret: 1, barre: null },
  'A7':   { frets: [-1,0,2,0,2,0], baseFret: 1, barre: null },
  'Cadd9':{ frets: [-1,3,2,0,3,0], baseFret: 1, barre: null },
  'Dadd9':{ frets: [-1,-1,0,2,3,0], baseFret: 1, barre: null },
  'Cmaj7':{ frets: [-1,3,2,0,0,0], baseFret: 1, barre: null },
  'Gmaj7':{ frets: [3,2,0,0,0,2], baseFret: 1, barre: null },
  'Emaj7':{ frets: [0,2,1,1,0,0], baseFret: 1, barre: null },
  'Amaj7':{ frets: [-1,0,2,1,2,0], baseFret: 1, barre: null },
};

// Piano chord notes (semitones from C)
const PIANO_CHORDS = {
  'C':[0,4,7],'D':[2,6,9],'E':[4,8,11],'F':[5,9,0],'G':[7,11,2],'A':[9,1,4],'B':[11,3,6],
  'C#':[1,5,8],'Db':[1,5,8],'D#':[3,7,10],'Eb':[3,7,10],'F#':[6,10,1],'Gb':[6,10,1],
  'G#':[8,0,3],'Ab':[8,0,3],'A#':[10,2,5],'Bb':[10,2,5],
  'Em':[4,7,11],'Am':[9,0,4],'Dm':[2,5,9],'Bm':[11,2,6],'F#m':[6,9,1],'C#m':[1,4,8],'G#m':[8,11,3],
  'Gsus4':[7,0,2],'Dsus4':[2,7,9],'Asus2':[9,11,4],'Asus4':[9,2,4],'Esus4':[4,9,11],
  'G7':[7,11,2,5],'D7':[2,6,9,0],'E7':[4,8,11,2],'A7':[9,1,4,7],
  'Cmaj7':[0,4,7,11],'Gmaj7':[7,11,2,6],'Emaj7':[4,8,11,3],'Amaj7':[9,1,4,8],
  'Cadd9':[0,4,7,2],'Dadd9':[2,6,9,4],
};

// ── Guitar SVG diagram ────────────────────────────────────────────────────────
function GuitarDiagram({ chord }) {
  const data = GUITAR_CHORDS[chord];
  if (!data) return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-xs italic">
      Diagram coming soon
    </div>
  );
  const { frets, baseFret, barre } = data;
  const numStrings = 6;
  const numFrets = 5;
  const cellW = 34, cellH = 26, padLeft = 30, padTop = 26;
  const width = cellW * (numStrings - 1) + padLeft * 2;
  const height = cellH * numFrets + padTop + 22;

  return (
    <svg width={width} height={height} className="mx-auto">
      {baseFret === 1 ? (
        <rect x={padLeft} y={padTop} width={cellW * (numStrings - 1)} height={4} fill="#888" rx={2} />
      ) : (
        <text x={6} y={padTop + 12} fontSize="10" fill="#888">{baseFret}fr</text>
      )}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line key={i} x1={padLeft} y1={padTop + 4 + i * cellH} x2={padLeft + cellW * (numStrings - 1)} y2={padTop + 4 + i * cellH} stroke="#2a2a3a" strokeWidth={1} />
      ))}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line key={i} x1={padLeft + i * cellW} y1={padTop + 4} x2={padLeft + i * cellW} y2={padTop + 4 + numFrets * cellH} stroke="#444" strokeWidth={1} />
      ))}
      {barre && (
        <rect x={padLeft} y={padTop + 4 + (barre - baseFret) * cellH - 9} width={cellW * (numStrings - 1)} height={18} rx={9} fill="hsl(var(--primary))" opacity={0.85} />
      )}
      {frets.map((fret, si) => {
        const x = padLeft + si * cellW;
        if (fret === -1) return <text key={si} x={x} y={padTop - 8} fontSize="12" fill="#ef4444" textAnchor="middle">×</text>;
        if (fret === 0) return <circle key={si} cx={x} cy={padTop - 10} r={5} fill="none" stroke="#888" strokeWidth={1.5} />;
        const y = padTop + 4 + (fret - baseFret) * cellH + cellH / 2;
        return <circle key={si} cx={x} cy={y} r={9} fill="hsl(var(--primary))" />;
      })}
      {['E','A','D','G','B','e'].map((n, i) => (
        <text key={i} x={padLeft + i * cellW} y={height - 3} fontSize="9" fill="#555" textAnchor="middle">{n}</text>
      ))}
    </svg>
  );
}

// ── Piano SVG diagram ─────────────────────────────────────────────────────────
function PianoDiagram({ chord }) {
  const root = chord.match(/^([A-G][b#]?)/)?.[1];
  const notes = PIANO_CHORDS[chord] || PIANO_CHORDS[root] || [];
  const whites = [0,2,4,5,7,9,11];
  const blacks = [1,3,6,8,10];
  const blackPos = {1:0.7, 3:1.7, 6:3.7, 8:4.7, 10:5.7};
  const W=26, H=80, bW=16, bH=52;
  return (
    <svg width={whites.length * W} height={H + 18} className="mx-auto mt-2">
      {whites.map((note, i) => {
        const active = notes.map(n => ((n%12)+12)%12).includes(note);
        return <rect key={i} x={i*W} y={0} width={W-1} height={H} rx={2} fill={active ? 'hsl(var(--primary))' : '#e8e8f0'} stroke="#aaa" strokeWidth={1} />;
      })}
      {blacks.map(note => {
        const active = notes.map(n => ((n%12)+12)%12).includes(note);
        const x = blackPos[note] * W;
        return <rect key={note} x={x} y={0} width={bW} height={bH} rx={2} fill={active ? 'hsl(var(--primary) / 0.9)' : '#18182e'} />;
      })}
      <text x={(whites.length*W)/2} y={H+14} fontSize="10" fill="#666" textAnchor="middle">{chord}</text>
    </svg>
  );
}

// ── Chord diagram inline panel ────────────────────────────────────────────────
function ChordPanel({ chord, onClose }) {
  const [view, setView] = useState('guitar');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="bg-[#1e1e30] border border-primary/30 rounded-2xl p-4 shadow-2xl shadow-primary/10"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-bold text-foreground font-mono">{chord}</p>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground">
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="flex bg-secondary/40 rounded-lg p-0.5 mb-3">
        {['guitar','piano'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all ${view===v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {v === 'guitar' ? '🎸 Guitar' : '🎹 Piano'}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center py-2 min-h-[120px]">
        {view === 'guitar' ? <GuitarDiagram chord={chord} /> : <PianoDiagram chord={chord} />}
      </div>
    </motion.div>
  );
}

// ── Interactive chord line renderer ───────────────────────────────────────────
function ChordLine({ line, onChordClick }) {
  const parts = [];
  let lastIdx = 0, match;
  const re = new RegExp(CHORD_REGEX.source, 'g');
  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIdx) parts.push({ type: 'text', value: line.slice(lastIdx, match.index) });
    parts.push({ type: 'chord', value: match[0] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < line.length) parts.push({ type: 'text', value: line.slice(lastIdx) });
  return (
    <span>
      {parts.map((p, i) =>
        p.type === 'chord' ? (
          <button key={i} onClick={() => onChordClick(p.value)}
            className="text-primary font-bold hover:bg-primary/20 rounded px-0.5 transition-colors cursor-pointer font-mono underline-offset-2 hover:underline">
            {p.value}
          </button>
        ) : (
          <span key={i} className="font-mono">{p.value}</span>
        )
      )}
    </span>
  );
}

// ── Main Song Preview Modal ───────────────────────────────────────────────────
export default function SongPreviewModal({ song, initialTab = 'chart', onClose, onEdit }) {
  const [tab, setTab] = useState(initialTab);
  const [semitones, setSemitones] = useState(0);
  const [useFlats, setUseFlats] = useState(false);
  const [nashville, setNashville] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [activeChord, setActiveChord] = useState(null);
  const [chordView, setChordView] = useState('guitar');

  useEffect(() => { setTab(initialTab); setActiveChord(null); setSemitones(0); }, [song?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const originalKey = song?.key || 'G';
  // Find the original key index in either scale, then look up in the preferred scale
  const origIdxSharp = ALL_KEYS_SHARP.findIndex(k => k === originalKey);
  const origIdx = origIdxSharp !== -1 ? origIdxSharp : ALL_KEYS_FLAT.findIndex(k => k === originalKey);
  const KEYS = useFlats ? ALL_KEYS_FLAT : ALL_KEYS_SHARP;
  const currentKey = origIdx !== -1 ? KEYS[((origIdx + semitones) % 12 + 12) % 12] : originalKey;
  const capo = suggestCapo(originalKey, currentKey);

  const transposedChart = transposeFullChart(song?.chart_content || '', semitones, currentKey, useFlats);
  const displayChart = nashville ? chartToNashville(transposedChart, currentKey) : transposedChart;

  // Extract only the chords actually in this song
  const songChords = useMemo(() => extractChordsFromChart(song?.chart_content || ''), [song?.chart_content]);

  const sections = song?.arrangement_sections || [];

  const renderChart = () => {
    if (!displayChart?.trim()) return (
      <p className="text-muted-foreground text-sm italic text-center py-8">No chart available yet.</p>
    );
    return displayChart.split('\n').map((line, i) => {
      if (isSectionHeader(line)) return (
        <p key={i} className="text-primary font-bold mt-5 mb-1 text-sm tracking-wide" style={{ fontSize: fontSize + 1 }}>{line}</p>
      );
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      if (isChordLine(line)) return (
        <p key={i} className="text-foreground leading-relaxed" style={{ fontSize }}>
          <ChordLine line={line} onChordClick={setActiveChord} />
        </p>
      );
      return <p key={i} className="text-muted-foreground leading-relaxed" style={{ fontSize }}>{line}</p>;
    });
  };

  const hasChart = !!song?.chart_content?.trim();
  const hasLyrics = !!song?.lyrics?.trim();
  const isSpotifyImport = !!song?.spotify_url;

  const TABS = [
    { id: 'chart', label: hasChart ? '📄 Chart' : hasLyrics ? '🎵 Lyrics' : '📄 Chart' },
    { id: 'chords', label: '🎸 Chords' },
    { id: 'patches', label: '🎛 Patches' },
    { id: 'prod', label: '🎬 Prod' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#14141f] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[95vh] sm:max-h-[88vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Top gradient accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="relative flex items-start gap-4 px-5 pt-5 pb-3 shrink-0">
            {/* Artwork */}
            <div className="relative shrink-0">
              {song?.artwork_url ? (
                <img src={song.artwork_url} alt={song.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg shadow-black/40 border border-white/10" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Music className="w-7 h-7 text-primary" />
                </div>
              )}
            </div>

            {/* Title / artist */}
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-lg font-bold text-foreground leading-tight truncate">{song?.title || 'Untitled'}</h2>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{song?.artist}</p>
              {/* Meta pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {song?.key && <span className="text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 rounded-full px-2.5 py-0.5">Key: {song.key}</span>}
                {song?.bpm && <span className="text-[10px] font-semibold bg-white/5 text-muted-foreground border border-white/10 rounded-full px-2.5 py-0.5">{song.bpm} BPM</span>}
                {song?.time_signature && <span className="text-[10px] font-semibold bg-white/5 text-muted-foreground border border-white/10 rounded-full px-2.5 py-0.5">{song.time_signature}</span>}
                {Number(song?.capo) > 0 && <span className="text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 rounded-full px-2.5 py-0.5">Capo {song.capo}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              {onEdit && (
                <button onClick={() => onEdit(song)}
                  className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 hover:bg-primary/20 transition-colors">
                  Edit
                </button>
              )}
              <button onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Arrangement chips */}
          {sections.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 pb-3 shrink-0">
              {sections.map(s => (
                <span key={s} className="text-[10px] font-bold bg-secondary/40 text-muted-foreground border border-white/8 rounded-md px-2.5 py-0.5">{s}</span>
              ))}
            </div>
          )}

          {/* Gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-5 shrink-0" />

          {/* Tabs */}
          <div className="flex px-5 pt-2 pb-0 gap-0 shrink-0 border-b border-white/8">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${
                  tab === t.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
                {/* ── CHART TAB ── */}
                {tab === 'chart' && (
                  <div className="space-y-3">
                    {/* ── Case 1: Chord chart exists ── */}
                    {hasChart && (
                      <>
                        {/* Toolbar */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 border border-white/8">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">KEY</span>
                            <span className="text-sm font-bold text-primary font-mono">{currentKey}</span>
                          </div>
                          {song?.bpm && (
                            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 border border-white/8">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">BPM</span>
                              <span className="text-sm font-bold text-foreground font-mono">{song.bpm}</span>
                            </div>
                          )}
                          {capo > 0 && (
                            <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-1.5 border border-primary/20">
                              <span className="text-[9px] text-primary font-bold uppercase tracking-wider">CAPO</span>
                              <span className="text-sm font-bold text-primary font-mono">{capo}</span>
                            </div>
                          )}
                          <div className="flex-1" />
                          <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/8 p-1">
                            <button onClick={() => setSemitones(s => s - 1)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors font-bold">−</button>
                            <span className="text-xs text-muted-foreground px-2 font-mono min-w-[28px] text-center">
                              {semitones === 0 ? 'orig' : `${semitones > 0 ? '+' : ''}${semitones}`}
                            </span>
                            <button onClick={() => setSemitones(s => s + 1)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors font-bold">+</button>
                          </div>
                          <button onClick={() => setUseFlats(f => !f)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold border transition-all ${useFlats ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/5 border-white/8 text-muted-foreground hover:text-foreground'}`}>
                            {useFlats ? '♭' : '♯'}
                          </button>
                          <button onClick={() => setNashville(n => !n)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${nashville ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/5 border-white/8 text-muted-foreground hover:text-foreground'}`}>
                            NNS
                          </button>
                        </div>
                        <div className="bg-black/30 border border-white/8 rounded-xl p-4 overflow-y-auto max-h-[50vh]">
                          <div className="leading-relaxed space-y-0.5">
                            {renderChart()}
                          </div>
                        </div>
                        {songChords.length > 0 && (
                          <p className="text-[10px] text-muted-foreground text-center">
                            Tap any chord above to see how to play it
                          </p>
                        )}
                      </>
                    )}

                    {/* ── Case 2: Lyrics only (no chord chart) ── */}
                    {!hasChart && hasLyrics && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Lyrics Only</span>
                          <span className="text-[10px] font-semibold text-muted-foreground/60 bg-white/5 border border-white/8 rounded-full px-2 py-0.5">No chord chart</span>
                          {isSpotifyImport && (
                            <span className="text-[10px] font-semibold text-green-400/70 bg-green-500/8 border border-green-500/15 rounded-full px-2 py-0.5">Spotify import</span>
                          )}
                        </div>
                        {isSpotifyImport && (
                          <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2">
                            <span className="text-muted-foreground text-xs">ℹ️</span>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              Lyrics were entered manually. Spotify does not provide licensed lyrics via their API.
                            </p>
                          </div>
                        )}
                        <div className="bg-black/30 border border-white/8 rounded-xl p-5 overflow-y-auto max-h-[52vh]">
                          <div className="space-y-0 leading-loose">
                            {song.lyrics.split('\n').map((line, i) => {
                              if (line.trim() === '') return <div key={i} className="h-3" />;
                              // Section headers: lines ending with ":" or wrapped in []
                              const isSectionLabel = /^\[.+\]$/.test(line.trim()) || /^[\w\s]+:$/.test(line.trim());
                              if (isSectionLabel) return (
                                <p key={i} className="text-primary font-bold text-sm tracking-wide mt-4 mb-1 first:mt-0">{line}</p>
                              );
                              return (
                                <p key={i} className="text-foreground/90 text-sm leading-relaxed">{line}</p>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 text-center">
                          Add a chord chart in Edit → Chart to enable transpose & chord diagrams
                        </p>
                      </>
                    )}

                    {/* ── Case 3: Neither chart nor lyrics ── */}
                    {!hasChart && !hasLyrics && (
                      <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="text-2xl">📄</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">No chart or lyrics yet</p>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
                            {isSpotifyImport
                              ? "Spotify doesn't provide chord charts or lyrics. Add them manually using the Edit button."
                              : "Add a chord chart or paste lyrics to use this view."}
                          </p>
                        </div>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(song)}
                            className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 hover:bg-primary/20 transition-colors"
                          >
                            {isSpotifyImport ? 'Add Chart or Lyrics →' : 'Open Editor →'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── CHORDS TAB ── */}
                {tab === 'chords' && (
                  <div>
                    {songChords.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8 italic">
                        Add a chord chart first to see "How To Play" diagrams.
                      </p>
                    ) : (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
                          How To Play — Chords In This Song
                        </p>
                        <div className="flex bg-white/5 rounded-xl p-1 mb-4 border border-white/8 w-fit">
                          {['guitar','piano'].map(v => (
                            <button key={v} onClick={() => setChordView(v)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chordView === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                              {v === 'guitar' ? '🎸 Guitar' : '🎹 Piano'}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {songChords.map(chord => (
                            <div key={chord} className="bg-white/4 border border-white/8 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors">
                              <p className="text-xs font-bold text-foreground font-mono">{chord}</p>
                              {chordView === 'guitar' ? <GuitarDiagram chord={chord} /> : <PianoDiagram chord={chord} />}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── PATCHES TAB ── */}
                {tab === 'patches' && (
                  <div className="space-y-4">
                    {song?.guitar_patch_notes ? (
                      <div className="bg-white/4 border border-white/8 rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">🎸 Guitar</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{song.guitar_patch_notes}</p>
                      </div>
                    ) : null}
                    {song?.keys_patch_notes ? (
                      <div className="bg-white/4 border border-white/8 rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">🎹 Keys</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{song.keys_patch_notes}</p>
                      </div>
                    ) : null}
                    {!song?.guitar_patch_notes && !song?.keys_patch_notes && (
                      <p className="text-sm text-muted-foreground text-center py-8 italic">No patch notes yet.</p>
                    )}
                  </div>
                )}

                {/* ── PROD TAB ── */}
                {tab === 'prod' && (
                  <div>
                    {song?.production_notes ? (
                      <div className="bg-white/4 border border-white/8 rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">🎬 Production Notes</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{song.production_notes}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8 italic">No production notes yet.</p>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Bottom: active chord popup */}
          <AnimatePresence>
            {activeChord && (
              <div className="px-5 pb-5 shrink-0">
                <ChordPanel chord={activeChord} onClose={() => setActiveChord(null)} />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}