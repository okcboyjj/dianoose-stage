import { useState } from "react";
import { Maximize2, Minimize2, Type } from "lucide-react";
import { transposeFullChart, chartToNashville, ALL_KEYS, suggestCapo } from "./ChordTransposer";
import ChordDiagramPopup from "./ChordDiagram";

const CHORD_REGEX = /(?<![A-Za-z#b])([A-G][b#]?(?:maj7|maj|min7|m7|m|sus4|sus2|sus|add9|add2|dim7|dim|aug|7|9|11)?(?:\/[A-G][b#]?)?)(?![A-Za-z#])/g;

function isChordLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('[')) return false;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const chordCount = tokens.filter(t => /^[A-G][b#]?(?:maj7|maj|min7|m7|m|sus4|sus2|sus|add9|add2|dim7|dim|aug|7|9|11|13)?(?:\/[A-G][b#]?)?$/.test(t)).length;
  return chordCount > 0 && chordCount >= tokens.length * 0.5 && !/[,!?]/.test(trimmed);
}

function isSectionHeader(line) {
  const t = line.trim();
  if (t.startsWith('[')) return true;
  return /^(verse|chorus|bridge|pre.?chorus|intro|outro|tag|interlude|hook|vamp|instrumental|refrain)\s*\d*$/i.test(t);
}

function InteractiveChordLine({ line, onChordClick }) {
  const parts = [];
  let lastIdx = 0;
  let match;
  const regex = new RegExp(CHORD_REGEX.source, 'g');
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIdx) parts.push({ type: 'text', value: line.slice(lastIdx, match.index) });
    parts.push({ type: 'chord', value: match[0] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < line.length) parts.push({ type: 'text', value: line.slice(lastIdx) });

  return (
    <span style={{ whiteSpace: 'pre', fontFamily: 'inherit' }}>
      {parts.map((p, i) =>
        p.type === 'chord' ? (
          <span
            key={i}
            onClick={() => onChordClick(p.value)}
            className="inline-flex items-center justify-center text-primary font-bold bg-primary/10 border border-primary/25 rounded-lg shadow-sm shadow-primary/10 cursor-pointer transition-all duration-200 ease-out hover:scale-110 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            style={{
              minWidth: `${Math.max(p.value.length, 2)}ch`,
              minHeight: '1.55em',
              padding: '0 0.28em',
              margin: '0 -0.05em',
              lineHeight: 1,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              whiteSpace: 'pre',
              verticalAlign: 'baseline',
              transformOrigin: 'center',
            }}
          >
            {p.value}
          </span>
        ) : (
          <span key={i} style={{ whiteSpace: 'pre', fontFamily: 'inherit' }}>{p.value}</span>
        )
      )}
    </span>
  );
}

export default function ChartViewer({ song, initialKey, initialSemitones = 0 }) {
  const [semitones, setSemitones] = useState(initialSemitones);
  const [nashville, setNashville] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeChord, setActiveChord] = useState(null);

  const originalKey = song?.key || 'G';
  const currentKey = ALL_KEYS[(ALL_KEYS.indexOf(originalKey) + semitones + 12 * 10) % 12] || originalKey;
  const capo = suggestCapo(originalKey, currentKey);

  const transposedChart = transposeFullChart(song?.chart_content || '', semitones, currentKey);
  const displayChart = nashville ? chartToNashville(transposedChart, currentKey) : transposedChart;

  const handleTranspose = (dir) => setSemitones(s => (s + dir + 12) % 12 === 0 ? 0 : s + dir);

  const renderChart = () => {
    if (!displayChart) return <p className="text-muted-foreground text-sm italic">No chart available for this song.</p>;
    return displayChart.split('\n').map((line, i) => {
      if (isSectionHeader(line)) {
        return (
          <p key={i} className="text-primary font-bold mt-4 mb-1" style={{ fontSize: fontSize }}>
            {line}
          </p>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      if (isChordLine(line)) {
        return (
          <div key={i} style={{ fontSize, fontFamily: 'monospace', whiteSpace: 'pre', lineHeight: '1.6' }} className="text-foreground">
            <InteractiveChordLine line={line} onChordClick={setActiveChord} />
          </div>
        );
      }
      return (
        <div key={i} style={{ fontSize, fontFamily: 'monospace', whiteSpace: 'pre', lineHeight: '1.6' }} className="text-muted-foreground">
          {line}
        </div>
      );
    });
  };

  const content = (
    <div className={`flex flex-col ${fullscreen ? 'h-screen bg-background' : ''}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-2 flex-wrap ${fullscreen ? 'p-4 border-b border-border/40 bg-card' : 'mb-3'}`}>
        {/* Key header */}
        <div className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-3 py-1.5 border border-border/30">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">KEY</span>
          <span className="text-sm font-bold text-primary font-mono">{currentKey}</span>
        </div>
        {song?.bpm && (
          <div className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-3 py-1.5 border border-border/30">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">BPM</span>
            <span className="text-sm font-bold text-foreground font-mono">{song.bpm}</span>
          </div>
        )}
        {capo > 0 && (
          <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-1.5 border border-primary/20">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">CAPO</span>
            <span className="text-sm font-bold text-primary font-mono">{capo}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Transpose controls */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg border border-border/30 p-1">
          <button onClick={() => handleTranspose(-1)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-bold text-sm">−</button>
          <span className="text-xs text-muted-foreground px-2 font-mono min-w-[28px] text-center">
            {semitones === 0 ? 'orig' : `${semitones > 0 ? '+' : ''}${semitones}`}
          </span>
          <button onClick={() => handleTranspose(1)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-bold text-sm">+</button>
        </div>

        {/* Nashville toggle */}
        <button
          onClick={() => setNashville(n => !n)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${nashville ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border/30 text-muted-foreground hover:text-foreground'}`}
        >
          NNS
        </button>

        {/* Font size */}
        <div className="flex items-center gap-1">
          <button onClick={() => setFontSize(f => Math.max(10, f - 1))} className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Type className="w-3 h-3" />
          </button>
          <button onClick={() => setFontSize(f => Math.min(20, f + 1))} className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen */}
        <button
          onClick={() => setFullscreen(f => !f)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary/50 border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Chart content */}
      <div className={`${fullscreen ? 'flex-1 overflow-y-auto p-6' : 'bg-background/50 border border-border/30 rounded-xl p-4 overflow-y-auto max-h-80'}`}>
        <div style={{ fontFamily: 'monospace' }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[150] bg-background">
        {content}
        {activeChord && <ChordDiagramPopup chord={activeChord} onClose={() => setActiveChord(null)} />}
      </div>
    );
  }

  return (
    <div>
      {content}
      {activeChord && <ChordDiagramPopup chord={activeChord} onClose={() => setActiveChord(null)} />}
    </div>
  );
}
