import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChordDiagramPopup from "./ChordDiagram";
import ChartViewer from "./ChartViewer";

const GUITAR_CHORDS_CATALOG = [
  { name: 'G', type: 'Major' }, { name: 'C', type: 'Major' }, { name: 'D', type: 'Major' },
  { name: 'E', type: 'Major' }, { name: 'A', type: 'Major' }, { name: 'F', type: 'Major' },
  { name: 'Em', type: 'Minor' }, { name: 'Am', type: 'Minor' }, { name: 'Dm', type: 'Minor' },
  { name: 'Bm', type: 'Minor' }, { name: 'F#m', type: 'Minor' }, { name: 'C#m', type: 'Minor' },
  { name: 'G7', type: '7th' }, { name: 'D7', type: '7th' }, { name: 'E7', type: '7th' }, { name: 'A7', type: '7th' },
  { name: 'Gsus4', type: 'Sus' }, { name: 'Dsus4', type: 'Sus' }, { name: 'Asus2', type: 'Sus' },
  { name: 'Cmaj7', type: '7th' }, { name: 'Gmaj7', type: '7th' },
  { name: 'Cadd9', type: 'Add' }, { name: 'Dadd9', type: 'Add' },
];

const CHORD_TYPES = ['All', 'Major', 'Minor', '7th', 'Sus', 'Add'];

// Mini guitar diagram for the catalog
const GUITAR_CHORDS_DATA = {
  'G': [[3,0],[1,0],[2,0]],
  'C': [[2,1],[1,2],[2,2]],
  'D': [[1,3],[3,2],[2,3]],
  'E': [[2,2],[3,2],[2,1]],
  'A': [[2,2],[2,3],[2,4]],
  'F': [[1,1],[2,1],[3,2],[3,3]],
  'Em': [[2,5],[3,5]],
  'Am': [[2,4],[1,3],[2,3]],
  'Dm': [[1,5],[3,4],[2,3]],
  'Bm': [[2,2],[3,3],[4,4],[4,5]], // barre at 2
  'F#m': [[2,2],[3,3],[4,4],[4,5]], // barre at 2
  'C#m': [[1,4],[2,5],[3,6],[4,6]],
};

function MiniGuitarDiagram({ chord }) {
  const strings = 6;
  const frets = 4;
  const cW = 12, cH = 10, padL = 8, padT = 14;
  const W = cW * (strings - 1) + padL * 2;
  const H = cH * frets + padT + 8;

  return (
    <svg width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
      {/* Nut */}
      <rect x={padL} y={padT} width={cW * (strings - 1)} height={2} fill="#666" rx={1} />
      {/* Fret lines */}
      {Array.from({ length: frets + 1 }).map((_, i) => (
        <line key={i} x1={padL} y1={padT + 2 + i * cH} x2={padL + cW * (strings - 1)} y2={padT + 2 + i * cH} stroke="#333" strokeWidth={0.5} />
      ))}
      {/* String lines */}
      {Array.from({ length: strings }).map((_, i) => (
        <line key={i} x1={padL + i * cW} y1={padT + 2} x2={padL + i * cW} y2={padT + 2 + frets * cH} stroke="#444" strokeWidth={0.5} />
      ))}
      {/* Dots from simplified data */}
      {(GUITAR_CHORDS_DATA[chord] || []).map(([str, fret], i) => (
        <circle key={i} cx={padL + (str - 1) * cW} cy={padT + 2 + (fret - 1) * cH + cH / 2} r={3.5} fill="hsl(var(--primary))" />
      ))}
    </svg>
  );
}

export default function ChartBuilderModal({ song, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('chords');
  const [editTab, setEditTab] = useState('edit'); // for edit view: edit / preview
  const [chartContent, setChartContent] = useState(song?.chart_content || '');
  const [activeChord, setActiveChord] = useState(null);
  const [chordTypeFilter, setChordTypeFilter] = useState('All');

  const filteredChords = GUITAR_CHORDS_CATALOG.filter(c =>
    chordTypeFilter === 'All' || c.type === chordTypeFilter
  );

  const handleSave = () => onSave?.(chartContent);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
          className="relative bg-[#1a1a2e] border border-border/40 rounded-t-2xl sm:rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[88vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3 shrink-0">
            <div>
              <p className="text-base font-bold text-foreground">Chart Builder — {song?.title}</p>
              <p className="text-xs text-muted-foreground">{song?.artist} · Key: {song?.key} · {song?.bpm} BPM</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => window.print()}
                className="text-muted-foreground h-8 gap-1.5 text-xs">
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>
              <Button size="sm" onClick={handleSave}
                className="bg-primary text-primary-foreground h-8 gap-1.5 text-xs font-semibold">
                <Save className="w-3.5 h-3.5" /> Save
              </Button>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View tabs */}
          <div className="flex bg-secondary/30 rounded-xl mx-5 mb-3 p-1 shrink-0">
            {['edit', 'preview', 'chords', 'annotate'].map(t => (
              <button
                key={t}
                onClick={() => { setActiveTab(t); setEditTab(t === 'edit' ? 'edit' : t === 'preview' ? 'preview' : t); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t === 'edit' ? '✏ Edit' : t === 'preview' ? '👁 Preview' : t === 'chords' ? '🎸 Chords' : '✍ Annotate'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            {activeTab === 'edit' && (
              <Textarea
                value={chartContent}
                onChange={e => setChartContent(e.target.value)}
                className="w-full h-full min-h-[400px] bg-background/60 border-border/40 text-sm font-mono leading-relaxed resize-none"
                placeholder="[Verse 1]&#10;G      Em&#10;You are here, moving in our midst..."
              />
            )}

            {activeTab === 'preview' && (
              <ChartViewer song={{ ...song, chart_content: chartContent }} />
            )}

            {activeTab === 'chords' && (
              <div>
                {/* Filter pills */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {CHORD_TYPES.map(t => (
                    <button key={t} onClick={() => setChordTypeFilter(t)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${chordTypeFilter === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border'}`}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Chord grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filteredChords.map(chord => (
                    <button
                      key={chord.name}
                      onClick={() => setActiveChord(chord.name)}
                      className="bg-secondary/30 border border-border/40 hover:border-primary/40 hover:bg-secondary/60 rounded-xl p-3 text-center transition-all group"
                    >
                      <MiniGuitarDiagram chord={chord.name} />
                      <p className="text-sm font-bold text-foreground mt-2 font-mono group-hover:text-primary transition-colors">
                        {chord.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'annotate' && (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                <div className="text-center">
                  <p className="text-lg mb-1">✍️</p>
                  <p className="font-medium">Annotation mode coming soon</p>
                  <p className="text-xs mt-1 opacity-60">Use the chart editor for notes</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {activeChord && (
        <ChordDiagramPopup chord={activeChord} onClose={() => setActiveChord(null)} />
      )}
    </AnimatePresence>
  );
}