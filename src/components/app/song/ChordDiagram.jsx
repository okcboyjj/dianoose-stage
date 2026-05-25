import { useState } from "react";
import { X } from "lucide-react";

// Guitar chord shape database
const GUITAR_CHORDS = {
  'C':    { frets: [-1,3,2,0,1,0], fingers: [0,3,2,0,1,0], baseFret: 1, name: 'C' },
  'C#':   { frets: [-1,4,3,1,2,1], fingers: [0,4,3,1,2,1], baseFret: 1, name: 'C#', barre: 1 },
  'Db':   { frets: [-1,4,3,1,2,1], fingers: [0,4,3,1,2,1], baseFret: 1, name: 'Db', barre: 1 },
  'D':    { frets: [-1,-1,0,2,3,2], fingers: [0,0,0,1,3,2], baseFret: 1, name: 'D' },
  'D#':   { frets: [-1,-1,1,3,4,3], fingers: [0,0,1,2,4,3], baseFret: 1, name: 'D#', barre: 1 },
  'Eb':   { frets: [-1,-1,1,3,4,3], fingers: [0,0,1,2,4,3], baseFret: 1, name: 'Eb', barre: 1 },
  'E':    { frets: [0,2,2,1,0,0], fingers: [0,2,3,1,0,0], baseFret: 1, name: 'E' },
  'F':    { frets: [1,1,2,3,3,1], fingers: [1,1,2,3,4,1], baseFret: 1, name: 'F', barre: 1 },
  'F#':   { frets: [2,2,3,4,4,2], fingers: [1,1,2,3,4,1], baseFret: 2, name: 'F#', barre: 2 },
  'Gb':   { frets: [2,2,3,4,4,2], fingers: [1,1,2,3,4,1], baseFret: 2, name: 'Gb', barre: 2 },
  'G':    { frets: [3,2,0,0,0,3], fingers: [2,1,0,0,0,3], baseFret: 1, name: 'G' },
  'G#':   { frets: [4,3,1,1,1,4], fingers: [4,3,1,1,1,4], baseFret: 1, name: 'G#', barre: 1 },
  'Ab':   { frets: [4,3,1,1,1,4], fingers: [4,3,1,1,1,4], baseFret: 1, name: 'Ab', barre: 1 },
  'A':    { frets: [-1,0,2,2,2,0], fingers: [0,0,2,1,3,0], baseFret: 1, name: 'A' },
  'A#':   { frets: [-1,1,3,3,3,1], fingers: [0,1,2,3,4,1], baseFret: 1, name: 'A#', barre: 1 },
  'Bb':   { frets: [-1,1,3,3,3,1], fingers: [0,1,2,3,4,1], baseFret: 1, name: 'Bb', barre: 1 },
  'B':    { frets: [-1,2,4,4,4,2], fingers: [0,1,2,3,4,1], baseFret: 2, name: 'B', barre: 2 },
  'Em':   { frets: [0,2,2,0,0,0], fingers: [0,2,3,0,0,0], baseFret: 1, name: 'Em' },
  'Am':   { frets: [-1,0,2,2,1,0], fingers: [0,0,3,2,1,0], baseFret: 1, name: 'Am' },
  'A#m':  { frets: [-1,1,3,3,2,1], fingers: [0,1,3,4,2,1], baseFret: 1, name: 'A#m', barre: 1 },
  'Bbm':  { frets: [-1,1,3,3,2,1], fingers: [0,1,3,4,2,1], baseFret: 1, name: 'Bbm', barre: 1 },
  'Dm':   { frets: [-1,-1,0,2,3,1], fingers: [0,0,0,2,3,1], baseFret: 1, name: 'Dm' },
  'D#m':  { frets: [-1,-1,1,3,4,2], fingers: [0,0,1,3,4,2], baseFret: 1, name: 'D#m', barre: 1 },
  'Ebm':  { frets: [-1,-1,1,3,4,2], fingers: [0,0,1,3,4,2], baseFret: 1, name: 'Ebm', barre: 1 },
  'Bm':   { frets: [-1,2,4,4,3,2], fingers: [0,1,3,4,2,1], baseFret: 2, name: 'Bm', barre: 2 },
  'F#m':  { frets: [2,4,4,2,2,2], fingers: [1,3,4,2,2,2], baseFret: 2, name: 'F#m', barre: 2 },
  'Gbm':  { frets: [2,4,4,2,2,2], fingers: [1,3,4,2,2,2], baseFret: 2, name: 'Gbm', barre: 2 },
  'C#m':  { frets: [-1,4,6,6,5,4], fingers: [0,1,3,4,2,1], baseFret: 4, name: 'C#m', barre: 4 },
  'Dbm':  { frets: [-1,4,6,6,5,4], fingers: [0,1,3,4,2,1], baseFret: 4, name: 'Dbm', barre: 4 },
  'G#m':  { frets: [4,6,6,4,4,4], fingers: [1,3,4,1,1,1], baseFret: 4, name: 'G#m', barre: 4 },
  'Abm':  { frets: [4,6,6,4,4,4], fingers: [1,3,4,1,1,1], baseFret: 4, name: 'Abm', barre: 4 },
  'Gsus4':{ frets: [3,3,0,0,1,3], fingers: [2,3,0,0,1,4], baseFret: 1, name: 'Gsus4' },
  'Dsus4':{ frets: [-1,-1,0,2,3,3], fingers: [0,0,0,1,3,4], baseFret: 1, name: 'Dsus4' },
  'Asus2':{ frets: [-1,0,2,2,0,0], fingers: [0,0,2,3,0,0], baseFret: 1, name: 'Asus2' },
  'G7':   { frets: [3,2,0,0,0,1], fingers: [3,2,0,0,0,1], baseFret: 1, name: 'G7' },
  'D7':   { frets: [-1,-1,0,2,1,2], fingers: [0,0,0,3,1,2], baseFret: 1, name: 'D7' },
  'E7':   { frets: [0,2,0,1,0,0], fingers: [0,2,0,1,0,0], baseFret: 1, name: 'E7' },
  'A7':   { frets: [-1,0,2,0,2,0], fingers: [0,0,2,0,3,0], baseFret: 1, name: 'A7' },
  'Cadd9':{ frets: [-1,3,2,0,3,0], fingers: [0,3,2,0,4,0], baseFret: 1, name: 'Cadd9' },
  'Dadd9':{ frets: [-1,-1,0,2,3,0], fingers: [0,0,0,1,2,0], baseFret: 1, name: 'Dadd9' },
  'Cmaj7':{ frets: [-1,3,2,0,0,0], fingers: [0,3,2,0,0,0], baseFret: 1, name: 'Cmaj7' },
  'Gmaj7':{ frets: [3,2,0,0,0,2], fingers: [2,1,0,0,0,3], baseFret: 1, name: 'Gmaj7' },
};

// Piano chord note map (MIDI relative, 0=C)
const PIANO_CHORDS = {
  'C':    [0, 4, 7],
  'D':    [2, 6, 9],
  'E':    [4, 8, 11],
  'F':    [5, 9, 0],
  'G':    [7, 11, 2],
  'A':    [9, 1, 4],
  'B':    [11, 3, 6],
  'C#':   [1, 5, 8],
  'Db':   [1, 5, 8],
  'D#':   [3, 7, 10],
  'Eb':   [3, 7, 10],
  'F#':   [6, 10, 1],
  'Gb':   [6, 10, 1],
  'G#':   [8, 0, 3],
  'Ab':   [8, 0, 3],
  'A#':   [10, 2, 5],
  'Bb':   [10, 2, 5],
  'Em':   [4, 7, 11],
  'Am':   [9, 0, 4],
  'Dm':   [2, 5, 9],
  'Bm':   [11, 2, 6],
  'F#m':  [6, 9, 1],
  'C#m':  [1, 4, 8],
  'G#m':  [8, 11, 3],
  'Gsus4':[7, 0, 2],
  'Dsus4':[2, 7, 9],
  'Asus2':[9, 11, 4],
  'G7':   [7, 11, 2, 5],
  'D7':   [2, 6, 9, 0],
  'E7':   [4, 8, 11, 2],
  'A7':   [9, 1, 4, 7],
  'Cmaj7':[0, 4, 7, 11],
  'Gmaj7':[7, 11, 2, 6],
  'Cadd9':[0, 4, 7, 2],
};

function GuitarDiagram({ chord }) {
  const data = GUITAR_CHORDS[chord];
  if (!data) return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
      Diagram coming soon
    </div>
  );

  const { frets, fingers, baseFret, barre } = data;
  const numStrings = 6;
  const numFrets = 5;
  const cellW = 36;
  const cellH = 28;
  const padLeft = 28;
  const padTop = 24;
  const width = cellW * (numStrings - 1) + padLeft * 2;
  const height = cellH * numFrets + padTop + 20;

  const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];

  return (
    <svg width={width} height={height} className="mx-auto">
      {/* Nut or base fret */}
      {baseFret === 1 ? (
        <rect x={padLeft} y={padTop} width={cellW * (numStrings - 1)} height={4} fill="#a0a0b0" rx={2} />
      ) : (
        <text x={4} y={padTop + 10} fontSize="11" fill="#a0a0b0">{baseFret}fr</text>
      )}

      {/* Fret lines */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line key={i} x1={padLeft} y1={padTop + 4 + i * cellH} x2={padLeft + cellW * (numStrings - 1)} y2={padTop + 4 + i * cellH} stroke="#3a3a4a" strokeWidth={1} />
      ))}

      {/* String lines */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line key={i} x1={padLeft + i * cellW} y1={padTop + 4} x2={padLeft + i * cellW} y2={padTop + 4 + numFrets * cellH} stroke="#5a5a6a" strokeWidth={1} />
      ))}

      {/* Barre */}
      {barre && frets.some(f => f === barre) && (
        <rect x={padLeft} y={padTop + 4 + (barre - baseFret) * cellH - 10} width={cellW * (numStrings - 1)} height={20} rx={10} fill="hsl(var(--primary))" opacity={0.85} />
      )}

      {/* Dots */}
      {frets.map((fret, si) => {
        const x = padLeft + si * cellW;
        if (fret === -1) {
          return <text key={si} x={x - 4} y={padTop - 6} fontSize="13" fill="#ef4444" textAnchor="middle">×</text>;
        }
        if (fret === 0) {
          return <circle key={si} cx={x} cy={padTop - 8} r={5} fill="none" stroke="#a0a0b0" strokeWidth={1.5} />;
        }
        const y = padTop + 4 + (fret - baseFret) * cellH + cellH / 2;
        return (
          <circle key={si} cx={x} cy={y} r={10} fill="hsl(var(--primary))" />
        );
      })}

      {/* String labels */}
      {stringNames.map((n, i) => (
        <text key={i} x={padLeft + i * cellW} y={height - 2} fontSize="9" fill="#666" textAnchor="middle">{n}</text>
      ))}
    </svg>
  );
}

function PianoDiagram({ chord }) {
  // Parse root from chord
  const match = chord.match(/^([A-G][b#]?)/);
  const root = match ? match[1] : null;
  
  // Build lookup key
  const key = PIANO_CHORDS[chord] ? chord : root;
  const notes = PIANO_CHORDS[key] || [];

  const whites = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
  const blacks = [1, 3, 6, 8, 10]; // C# D# F# G# A#
  const blackPos = { 1: 0.7, 3: 1.7, 6: 3.7, 8: 4.7, 10: 5.7 };

  const W = 24, H = 80, bW = 15, bH = 52;
  const totalW = whites.length * W;

  return (
    <svg width={totalW} height={H + 20} className="mx-auto mt-2">
      {/* White keys */}
      {whites.map((note, i) => {
        const active = notes.map(n => n % 12).includes(note);
        return (
          <g key={i}>
            <rect x={i * W} y={0} width={W - 1} height={H} rx={2} fill={active ? 'hsl(var(--primary))' : 'white'} stroke="#aaa" strokeWidth={1} />
            {active && <text x={i * W + W / 2} y={H - 8} fontSize="8" fill="white" textAnchor="middle">●</text>}
          </g>
        );
      })}
      {/* Black keys */}
      {blacks.map(note => {
        const active = notes.map(n => n % 12).includes(note);
        const x = blackPos[note] * W;
        return (
          <g key={note}>
            <rect x={x} y={0} width={bW} height={bH} rx={2} fill={active ? 'hsl(var(--primary) / 0.9)' : '#1a1a2e'} />
          </g>
        );
      })}
      <text x={totalW / 2} y={H + 15} fontSize="10" fill="#888" textAnchor="middle">{chord}</text>
    </svg>
  );
}

export default function ChordDiagramPopup({ chord, onClose }) {
  const [view, setView] = useState('guitar');

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border/60 rounded-2xl p-5 shadow-2xl w-full max-w-xs mx-4 mb-4 sm:mb-0 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-foreground font-mono">{chord}</p>
            <p className="text-xs text-muted-foreground">Chord diagram</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex bg-secondary/50 rounded-lg p-1 mb-4">
          {['guitar', 'piano'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {v === 'guitar' ? '🎸 Guitar' : '🎹 Piano'}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center py-3 min-h-[120px]">
          {view === 'guitar' ? <GuitarDiagram chord={chord} /> : <PianoDiagram chord={chord} />}
        </div>

        {view === 'guitar' && GUITAR_CHORDS[chord] && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Tap any chord in the chart to see its diagram
          </p>
        )}
      </div>
    </div>
  );
}