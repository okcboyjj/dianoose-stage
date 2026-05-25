import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    // Step 1: Extract chart structure with smart language detection
    const mainPrompt = `You are a worship chart OCR specialist. Extract ALL content from this worship chart image.

LANGUAGE DETECTION — critically important:
First, detect what language(s) the lyrics are written in:
- "English": lyrics are standard English words
- "Malayalam": lyrics are Malayalam Unicode script (ക, ത, etc.)
- "Manglish": Malayalam words phonetically written in English letters (e.g. "Njan ninne sthuthikkum", "Yeshu entae daivam")
- "Mixed": contains both English and Malayalam/Manglish sections

Set the "detected_language_type" field to one of: "English", "Malayalam", "Manglish", "Mixed"
Set the "language" field to: "English" for English, "Malayalam" for Malayalam/Manglish/Mixed

Return a JSON object with:
- title: string or null
- artist: string or null
- key: string (e.g. "G", "Am", "F#") or null
- bpm: number or null
- capo: number or null
- time_signature: string (e.g. "4/4") or null
- language: "English" or "Malayalam"
- detected_language_type: "English", "Malayalam", "Manglish", or "Mixed"
- lyrics: string — full lyrics without chords, sections separated by blank lines
- confidence_notes: string — any OCR issues, uncertain content, or language detection notes
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
- NEVER fabricate content — only extract what is visible in the image
- Section names go in name field, NOT in lyric text
- Handwritten chords ALWAYS override any printed chord beneath them
- Nashville numbers (1, 4, 5, 6m) are valid chords
- Slash chords like G/B are one chord symbol
- If lyrics are already Malayalam Unicode, preserve them exactly as-is
- If lyrics are English, do NOT add Malayalam fields`;

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
          detected_language_type: { type: "string" },
          lyrics: { type: "string" },
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

    const detectedType = mainResult.detected_language_type || 'English';

    // Step 2: Only run Malayalam conversion if lyrics are Manglish
    // - English: skip
    // - Malayalam Unicode: skip (already correct)
    // - Manglish: convert to Unicode, keep original as transliteration
    // - Mixed: convert Manglish portions only
    const rawLyrics = mainResult.lyrics || '';
    let malayalamResult = null;

    if (rawLyrics && (detectedType === 'Manglish' || detectedType === 'Mixed')) {
      const conversionPrompt = detectedType === 'Manglish'
        ? `You are a Manglish to Malayalam script converter for Christian worship songs.

The following lyrics are written in Manglish (Malayalam phonetics in English letters). Convert them directly into proper Malayalam Unicode script. Do NOT translate — just convert the phonetics to script.

Preserve all section labels (Verse 1, Chorus, Bridge etc.) and line breaks exactly.

Manglish lyrics:
${rawLyrics}

Return JSON: { malayalam_lyrics: string, transliteration_lyrics: string }
- transliteration_lyrics = the original Manglish text (copy it as-is)
- malayalam_lyrics = the Malayalam Unicode script version`
        : `You are a Malayalam/English mixed text processor for Christian worship songs.

The following lyrics contain both English and Manglish (Malayalam phonetics in English letters) sections.
- Convert any Manglish portions to Malayalam Unicode script.
- Keep English portions as-is in the transliteration field.
- Preserve all section labels and line breaks exactly.

Lyrics:
${rawLyrics}

Return JSON: { malayalam_lyrics: string, transliteration_lyrics: string }
- transliteration_lyrics = original text with English kept as-is
- malayalam_lyrics = Manglish converted to Unicode, English kept as-is`;

      malayalamResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: conversionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            malayalam_lyrics: { type: "string" },
            transliteration_lyrics: { type: "string" }
          }
        }
      }).catch(() => null);
    }

    // Build chart content from sections
    const pass1 = mainResult;
    const chordMaps = [];
    let lineIdx = 0;
    for (const section of (pass1.sections || [])) {
      for (const line of (section.lines || [])) {
        for (const c of (line.chords || [])) {
          chordMaps.push({ line_index: lineIdx, chord: c.chord, word_index: c.word_index });
        }
        lineIdx++;
      }
    }

    function buildChartContent(sections, allChordMaps) {
      const chordsByLine = {};
      for (const cm of (allChordMaps || [])) {
        if (!chordsByLine[cm.line_index]) chordsByLine[cm.line_index] = [];
        chordsByLine[cm.line_index].push(cm);
      }

      let li = 0;
      let chart = '';
      for (const section of (sections || [])) {
        chart += `[${section.name}]\n`;
        for (const lineObj of (section.lines || [])) {
          const lyric = lineObj.lyric || '';
          const chords = chordsByLine[li] || [];

          if (chords.length === 0) {
            chart += lyric + '\n';
          } else {
            const words = lyric.split(' ');
            const wordOffsets = [];
            let offset = 0;
            for (const w of words) {
              wordOffsets.push(offset);
              offset += w.length + 1;
            }
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
          li++;
        }
        chart += '\n';
      }
      return chart.trim();
    }

    const chart_content = buildChartContent(pass1.sections, chordMaps);

    // Resolve final Malayalam fields based on detected language
    let finalMalayalam = '';
    let finalTranslit = '';

    if (detectedType === 'Malayalam') {
      // Already Unicode — use as-is
      finalMalayalam = rawLyrics;
      finalTranslit = '';
    } else if (detectedType === 'Manglish' || detectedType === 'Mixed') {
      finalMalayalam = (malayalamResult?.malayalam_lyrics || '').trim() || '';
      finalTranslit = (malayalamResult?.transliteration_lyrics || '').trim() || rawLyrics;
    }
    // English: leave both empty

    const result = {
      ...mainResult,
      chart_content,
      malayalam_lyrics: finalMalayalam,
      transliteration_lyrics: finalTranslit,
      source_type: 'OCR Import',
      import_date: new Date().toISOString(),
    };

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});