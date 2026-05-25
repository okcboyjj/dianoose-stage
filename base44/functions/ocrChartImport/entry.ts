import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const prompt = `You are a worship chart OCR extraction specialist. Analyze this image of a worship song chart or lyrics sheet.

Extract ALL content carefully, preserving the exact structure. Return a JSON object with these fields:

- title: string (song title if visible, else null)
- artist: string (artist/composer if visible, else null)  
- key: string (musical key if detected, e.g. "G", "Am", "F#", else null)
- bpm: number (BPM if detected, else null)
- capo: number (capo position if detected, else null)
- time_signature: string (e.g. "4/4", else null)
- language: "English" | "Malayalam" | null
- chart_content: string (the full chord chart with chords and lyrics, preserving line breaks and spacing. Chord lines should have chords separated by spaces. Section headers like [Verse 1], [Chorus], [Bridge] should be on their own lines. Preserve all chord symbols exactly: G, D/F#, F#m7, Asus, Cadd9, Am7, Bb, Eb, Gsus4, Bm, etc.)
- malayalam_lyrics: string (if Malayalam script lyrics are present, extract them here with Unicode Malayalam characters preserved, else null)
- transliteration_lyrics: string (if English phonetic transliteration of Malayalam is present, extract here, else null)
- lyrics: string (English lyrics if present without chords, else null)
- section_headers: array of strings (detected section names like "Verse 1", "Chorus", "Bridge", etc.)
- confidence_notes: string (brief note about OCR confidence, any unclear parts, or warnings)
- source_type: "OCR Import"

IMPORTANT RULES:
- Preserve chord spacing EXACTLY as it appears above lyrics
- Malayalam Unicode characters must be preserved exactly - do NOT convert to transliteration
- If a line has chords above lyrics, put chords on one line, lyrics on the next
- Section headers go on their own line in [brackets] format
- If you see "Capo X" notation, extract the number
- Nashville numbers (1, 4, 5, etc.) should be preserved as-is in chart_content
- Slash chords like G/B, D/F# should be preserved exactly
- If confidence is low for any section, mention it in confidence_notes
- Never fabricate content that isn't clearly visible in the image`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
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
          chart_content: { type: "string" },
          malayalam_lyrics: { type: "string" },
          transliteration_lyrics: { type: "string" },
          lyrics: { type: "string" },
          section_headers: { type: "array", items: { type: "string" } },
          confidence_notes: { type: "string" },
          source_type: { type: "string" }
        }
      }
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});