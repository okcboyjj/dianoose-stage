// Chord transposition engine
const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP = { 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B' };

const enharmonicPrefer = {
  'C#': 'C#', 'D#': 'Eb', 'E': 'E', 'F#': 'F#', 'G#': 'Ab', 'A#': 'Bb', 'B': 'B',
  'C': 'C', 'D': 'D', 'F': 'F', 'G': 'G', 'A': 'A',
};

function noteToIndex(note) {
  const normalized = FLAT_TO_SHARP[note] || note;
  return SHARP_SCALE.indexOf(normalized);
}

function indexToNote(idx, preferFlats = false) {
  const note = SHARP_SCALE[((idx % 12) + 12) % 12];
  if (preferFlats) {
    const flatMap = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
    return flatMap[note] || note;
  }
  return note;
}

const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

export function transposeNote(note, semitones, targetKey, forceFlats) {
  // For natural flat keys (F, Bb, Eb, etc.), always prefer flats regardless of the toggle
  const isNaturalFlatKey = flatKeys.includes(targetKey);
  const preferFlats = isNaturalFlatKey ? true : (forceFlats !== undefined ? forceFlats : false);
  // parse root + quality
  const match = note.match(/^([A-G][b#]?)(.*)/);
  if (!match) return note;
  const [, root, quality] = match;
  const idx = noteToIndex(root);
  if (idx === -1) return note;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return indexToNote(newIdx, preferFlats) + quality;
}

export function transposeChord(chord, semitones, targetKey, forceFlats) {
  const needsFlatPass = semitones === 0 && (forceFlats || flatKeys.includes(targetKey));
  if (!chord || (semitones === 0 && !needsFlatPass)) return chord;
  // Handle slash chords: C/G
  if (chord.includes('/')) {
    const [top, bass] = chord.split('/');
    return transposeChord(top, semitones, targetKey, forceFlats) + '/' + transposeChord(bass, semitones, targetKey, forceFlats);
  }
  return transposeNote(chord, semitones, targetKey, forceFlats);
}

// Parse a chord line and transpose all chords
export function transposeChordLine(line, semitones, targetKey, forceFlats) {
  const needsFlatPass = semitones === 0 && (forceFlats || flatKeys.includes(targetKey));
  if (semitones === 0 && !needsFlatPass) return line;
  // Match chord tokens (letters followed by chord qualifiers)
  return line.replace(/(?<![A-Za-z#b])([A-G][b#]?(?:maj7|maj|min7|m7|m|sus4|sus2|sus|add9|add2|dim7|dim|aug|7|9|11|13)?(?:\/[A-G][b#]?)?)(?![A-Za-z#])/g, (match) => {
    return transposeChord(match, semitones, targetKey, forceFlats);
  });
}

export function transposeFullChart(chartContent, semitones, targetKey, forceFlats) {
  if (!chartContent) return chartContent;
  // If no transposition but flats are forced or key is a flat key, still run a flat-substitution pass
  const needsFlatPass = semitones === 0 && (forceFlats || flatKeys.includes(targetKey));
  if (semitones === 0 && !needsFlatPass) return chartContent;
  return chartContent.split('\n').map(line => {
    // Only transpose lines that look like chord lines (not section headers, not lyrics)
    const trimmed = line.trim();
    if (trimmed.startsWith('[') || trimmed === '') return line;
    // Heuristic: chord lines have few words and match chord patterns
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const chordCount = tokens.filter(t => /^[A-G][b#]?(?:maj7|maj|min7|m7|m|sus4|sus2|sus|add9|add2|dim7|dim|aug|7|9|11|13)?(?:\/[A-G][b#]?)?$/.test(t)).length;
    if (chordCount > 0 && chordCount >= tokens.length * 0.45 && !/[,!?]/.test(trimmed)) {
      return transposeChordLine(line, semitones, targetKey, forceFlats);
    }
    return line;
  }).join('\n');
}

export const NOTES_IN_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const ALL_KEYS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const ALL_KEYS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const ALL_KEYS = ALL_KEYS_SHARP; // default export kept for compatibility

export function semitonesBetween(fromKey, toKey) {
  const from = noteToIndex(fromKey);
  const to = noteToIndex(toKey);
  if (from === -1 || to === -1) return 0;
  return (to - from + 12) % 12;
}

// Nashville Number System
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const NASHVILLE_NUMERALS = ['1', '2', '3', '4', '5', '6', '7'];

export function toNashville(chord, keyRoot) {
  if (!chord || !keyRoot) return chord;
  const match = chord.match(/^([A-G][b#]?)(.*)/);
  if (!match) return chord;
  const [, root, quality] = match;
  const keyIdx = noteToIndex(keyRoot);
  const chordIdx = noteToIndex(root);
  if (keyIdx === -1 || chordIdx === -1) return chord;
  const interval = (chordIdx - keyIdx + 12) % 12;
  const scalePos = MAJOR_SCALE_INTERVALS.indexOf(interval);
  if (scalePos === -1) {
    // Chromatic — use b prefix
    const chromatic = MAJOR_SCALE_INTERVALS.findIndex(i => i > interval);
    return 'b' + NASHVILLE_NUMERALS[chromatic] + (quality.includes('m') && !quality.includes('maj') ? 'm' : '');
  }
  const num = NASHVILLE_NUMERALS[scalePos];
  const isMinor = (quality.includes('m') && !quality.includes('maj')) || quality.includes('min');
  return num + (isMinor ? 'm' : '') + (quality.includes('7') ? '7' : '') + (quality.includes('sus') ? 'sus' : '');
}

export function chartToNashville(chartContent, keyRoot) {
  if (!chartContent || !keyRoot) return chartContent;
  return chartContent.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') || trimmed === '') return line;
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const chordCount = tokens.filter(t => /^[A-G][b#]?(?:maj7|maj|min7|m7|m|sus4|sus2|sus|add9|add2|dim7|dim|aug|7|9|11|13)?(?:\/[A-G][b#]?)?$/.test(t)).length;
    if (chordCount > 0 && chordCount >= tokens.length * 0.5 && !/[,!?]/.test(trimmed)) {
      return line.replace(/(?<![A-Za-z#b])([A-G][b#]?(?:maj7|maj|min7|m7|m|sus4|sus2|sus|add9|dim7|dim|aug|7)?(?:\/[A-G][b#]?)?)(?![A-Za-z#])/g, (match) => {
        const slashIdx = match.indexOf('/');
        if (slashIdx > -1) {
          const top = match.slice(0, slashIdx);
          const bass = match.slice(slashIdx + 1);
          return toNashville(top, keyRoot) + '/' + toNashville(bass, keyRoot);
        }
        return toNashville(match, keyRoot);
      });
    }
    return line;
  }).join('\n');
}

// Capo suggestion: prefer simpler keys
const EASY_KEYS = ['G', 'A', 'C', 'D', 'E', 'F'];
export function suggestCapo(originalKey, currentKey) {
  if (originalKey === currentKey) return 0;
  // Try capos 1-7 and see which gives an easy key
  for (let capo = 1; capo <= 7; capo++) {
    const soundingIdx = noteToIndex(currentKey);
    const capoKeyIdx = (soundingIdx - capo + 12) % 12;
    const capoKey = SHARP_SCALE[capoKeyIdx];
    if (EASY_KEYS.includes(capoKey)) return capo;
  }
  return 0;
}