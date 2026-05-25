import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    // ── Pass 1: Extract lyrics, structure, and metadata ──────────────────────
    const pass1Prompt = `You are a worship chart OCR specialist. Extract the LYRICS and STRUCTURE from this worship chart image — do NOT try to map chords yet.

Return a JSON object:
- title: string or null
- artist: string or null
- key: string (e.g. "G", "Am", "F#") or null
- bpm: number or null
- capo: number or null (extract from "Capo X" notation if visible)
- time_signature: string (e.g. "4/4") or null
- language: "English" | "Malayalam" | null
- sections: array of objects, one per section in order:
    { name: string (e.g. "Verse 1", "Chorus", "Bridge"), lines: [ { lyric: string } ] }
  Each element of lines is one lyric line. Do NOT include chord lines here — pure lyrics only.
- malayalam_lyrics: string — Malayalam Unicode script if present, else null
- transliteration_lyrics: string — English phonetic transliteration of Malayalam if present, else null
- lyrics: string — full English lyrics without chords, sections separated by blank lines
- confidence_notes: string — any issues, unclear text, handwriting etc.
- source_type: "OCR Import"

Rules:
- Never fabricate content
- Preserve Malayalam Unicode exactly
- Section names go in the name field, NOT in the lyric lines`;

    const pass1 = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: pass1Prompt,
      model: "gpt_5_4",
      file_urls: [file_url],
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
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                lines: { type: "array", items: { type: "object", properties: { lyric: { type: "string" } } } }
              }
            }
          },
          malayalam_lyrics: { type: "string" },
          transliteration_lyrics: { type: "string" },
          lyrics: { type: "string" },
          confidence_notes: { type: "string" },
          source_type: { type: "string" }
        }
      }
    });

    // ── Pass 2: Map each chord to the word/syllable it sits above ─────────────
    // Build a flat list of all lyric lines with section+line index for the prompt
    const lyricLines = [];
    for (const section of (pass1.sections || [])) {
      for (let li = 0; li < (section.lines || []).length; li++) {
        lyricLines.push({ section: section.name, line_idx: li, lyric: section.lines[li].lyric });
      }
    }

    const pass2Prompt = `You are a chord-mapping specialist for worship charts.

I have already extracted the clean lyrics from this worship chart image. Your ONLY job is to identify the CHORDS and map each chord to which word (or syllable) in the lyric it sits above.

Here are the lyric lines, in order:
${lyricLines.map((l, i) => `[${i}] (${l.section}) ${l.lyric}`).join('\n')}

Look at the image and for each chord symbol you see, record:
- line_index: the [number] of the lyric line it belongs to
- chord: the chord symbol exactly as written (e.g. G, D/F#, F#m7, Asus2, Cadd9, Bb, Em7)
- word_index: which word in the lyric line the chord sits above (0 = first word)
- syllable_hint: optional — if the chord is mid-word, which syllable (e.g. "sec" for "second")

IMPORTANT:
- Handwritten chords in pen/pencil ALWAYS override any printed chord beneath them
- Nashville numbers (1, 4, 5, 6m etc.) are valid chords — include them
- Slash chords like G/B, D/F# are a single chord — preserve exactly
- If a chord sits between two words, pick the word it is closest to
- Do NOT invent chords not visible in the image
- If there are no chords in the image, return an empty chord_maps array`;

    const pass2 = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: pass2Prompt,
      model: "gpt_5_4",
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          chord_maps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                line_index: { type: "number" },
                chord: { type: "string" },
                word_index: { type: "number" },
                syllable_hint: { type: "string" }
              }
            }
          }
        }
      }
    });

    // ── Reconstruct chart_content from structured chord+lyric data ────────────
    function buildChartContent(sections, lyricLines, chordMaps) {
      // Group chord maps by line index
      const chordsByLine = {};
      for (const cm of (chordMaps || [])) {
        if (!chordsByLine[cm.line_index]) chordsByLine[cm.line_index] = [];
        chordsByLine[cm.line_index].push(cm);
      }

      let lineIdx = 0;
      let chart = '';
      for (const section of (sections || [])) {
        chart += `[${section.name}]\n`;
        for (const lineObj of (section.lines || [])) {
          const lyric = lineObj.lyric || '';
          const chords = chordsByLine[lineIdx] || [];

          if (chords.length === 0) {
            chart += lyric + '\n';
          } else {
            // Build a chord line aligned to word positions in the lyric
            const words = lyric.split(' ');
            // Compute character offset of each word start
            const wordOffsets = [];
            let offset = 0;
            for (const w of words) {
              wordOffsets.push(offset);
              offset += w.length + 1; // +1 for space
            }

            // Place chords at word offsets
            let chordLine = '';
            const sortedChords = [...chords].sort((a, b) => a.word_index - b.word_index);
            for (const cm of sortedChords) {
              const pos = wordOffsets[Math.min(cm.word_index, wordOffsets.length - 1)] || 0;
              while (chordLine.length < pos) chordLine += ' ';
              chordLine += cm.chord + ' ';
            }
            chart += chordLine.trimEnd() + '\n';
            chart += lyric + '\n';
          }
          lineIdx++;
        }
        chart += '\n';
      }
      return chart.trim();
    }

    const chart_content = buildChartContent(pass1.sections, lyricLines, pass2.chord_maps);

    const result = {
      ...pass1,
      chart_content,
      source_type: 'OCR Import'
    };

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});