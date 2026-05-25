import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    // ── Single combined pass + Malayalam in parallel ──────────────────────────
    const mainPrompt = `You are a worship chart OCR specialist. Extract ALL content from this worship chart image in one pass.

Return a JSON object with:
- title: string or null
- artist: string or null
- key: string (e.g. "G", "Am", "F#") or null
- bpm: number or null
- capo: number or null
- time_signature: string (e.g. "4/4") or null
- language: "English" | "Malayalam" | null
- lyrics: string — full lyrics without chords, sections separated by blank lines
- malayalam_lyrics: string — Malayalam Unicode script if present in image, else null
- transliteration_lyrics: string — English phonetic transliteration of Malayalam if present, else null
- confidence_notes: string — any OCR issues
- sections: array of section objects in order:
    {
      name: string,
      lines: [
        {
          lyric: string,
          chords: [ { chord: string, word_index: number } ]
        }
      ]
    }
  Each line has the lyric text AND any chords mapped to word positions (0 = first word).
  chord is the exact symbol (G, D/F#, F#m7, Bb, Em7, Asus2 etc.).
  If a line has no chords, chords = [].

Rules:
- Never fabricate content — only extract what is visible
- Preserve Malayalam Unicode exactly
- Section names go in name field, NOT in lyric text
- Handwritten chords ALWAYS override any printed chord beneath them
- Nashville numbers (1, 4, 5, 6m) are valid chords
- Slash chords like G/B are one chord symbol`;

    const malayalamPrompt = `You are a Malayalam translation specialist for Christian worship songs.

Given English worship song lyrics, do the following in order:
1. First produce a Manglish (English phonetic) transliteration of the Malayalam meaning — how the Malayalam words would sound written in English letters
2. Then convert that Manglish into proper Malayalam Unicode script

Rules:
- Preserve section structure (Verse 1, Chorus, Bridge etc.)
- Keep the same number of lines per section
- Translation should be singable and spiritually accurate
- transliteration_lyrics = the Manglish phonetic version
- malayalam_lyrics = the full Malayalam Unicode script derived from the transliteration

Return JSON: { transliteration_lyrics: string, malayalam_lyrics: string }`;

    // Step 1: Extract chart structure from image
    const mainResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: mainPrompt,
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
          lyrics: { type: "string" },
          malayalam_lyrics: { type: "string" },
          transliteration_lyrics: { type: "string" },
          confidence_notes: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                lines: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      lyric: { type: "string" },
                      chords: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            chord: { type: "string" },
                            word_index: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Step 2: Use the extracted English lyrics to generate Manglish transliteration,
    // then derive Malayalam script from it — passing lyrics as text (faster, no image needed)
    const englishLyrics = mainResult.lyrics || '';
    const malayalamResult = englishLyrics ? await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${malayalamPrompt}\n\nHere are the extracted English lyrics to translate:\n\n${englishLyrics}`,
      response_json_schema: {
        type: "object",
        properties: {
          malayalam_lyrics: { type: "string" },
          transliteration_lyrics: { type: "string" }
        }
      }
    }).catch(() => null) : null;

    // Use mainResult as pass1, build flat lyricLines for chart builder
    const pass1 = mainResult;
    const lyricLines = [];
    for (const section of (pass1.sections || [])) {
      for (let li = 0; li < (section.lines || []).length; li++) {
        lyricLines.push({ section: section.name, line_idx: li, lyric: section.lines[li].lyric });
      }
    }

    // Build chord_maps from the inline chords in sections
    const inlineChordMaps = [];
    let lineIdx = 0;
    for (const section of (pass1.sections || [])) {
      for (const line of (section.lines || [])) {
        for (const c of (line.chords || [])) {
          inlineChordMaps.push({ line_index: lineIdx, chord: c.chord, word_index: c.word_index });
        }
        lineIdx++;
      }
    }
    const pass2 = { chord_maps: inlineChordMaps };

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

    // Merge Malayalam — prefer dedicated translation pass, fallback to main extraction
    const finalMalayalam = (malayalamResult?.malayalam_lyrics && malayalamResult.malayalam_lyrics.trim())
      ? malayalamResult.malayalam_lyrics
      : (mainResult.malayalam_lyrics || '');
    const finalTranslit = (malayalamResult?.transliteration_lyrics && malayalamResult.transliteration_lyrics.trim())
      ? malayalamResult.transliteration_lyrics
      : (mainResult.transliteration_lyrics || '');

    const result = {
      ...mainResult,
      chart_content,
      malayalam_lyrics: finalMalayalam,
      transliteration_lyrics: finalTranslit,
      source_type: 'OCR Import'
    };

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});