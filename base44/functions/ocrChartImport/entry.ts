import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const prompt = `You are a worship chart OCR specialist. Your PRIMARY job is to extract chord charts with PIXEL-PERFECT chord placement above lyrics.

## CHORD PLACEMENT — THIS IS THE MOST IMPORTANT RULE
Chords in a worship chart float ABOVE lyrics at the exact horizontal position where they are played.
You MUST reproduce this using spaces so the chord aligns with the correct syllable.

FORMAT for each line pair:
  CHORD LINE:  Use spaces to position each chord above the syllable it belongs to
  LYRIC LINE:  The full lyric text

Example from image:
  If a chord "G" sits above the "A" in "Amazing" and "D" sits above "grace":
    G           D
    Amazing     grace how sweet the sound

  If "Em" is above "that" and "C" is above "saved":
    Em    C
    that  saved a wretch like me

NEVER just list chords separated by spaces without aligning them to syllables.
ALWAYS count the characters in the lyric to position chords correctly.
If you are unsure of exact position, get as close as possible — approximate is better than wrong.

## HANDWRITTEN vs PRINTED CHORDS
- This may be a PRINTED chart (VerseView, etc.) with HANDWRITTEN chord corrections on top.
- Handwritten chords in pen/pencil ALWAYS override printed chords beneath them.
- Use handwritten chords as the final version. Note this in confidence_notes.

## OUTPUT FORMAT
Return a JSON object:
- title: string or null
- artist: string or null
- key: string (e.g. "G", "Am", "F#") or null
- bpm: number or null
- capo: number or null (extract from "Capo X" notation)
- time_signature: string (e.g. "4/4") or null
- language: "English" | "Malayalam" | null
- chart_content: string — the FULL chart with space-aligned chord+lyric pairs. Section headers on their own line in [Verse 1] / [Chorus] / [Bridge] format. Nashville numbers (1, 4, 5) preserved as-is. Slash chords (G/B, D/F#) preserved exactly.
- malayalam_lyrics: string — Malayalam Unicode script if present, else null. Do NOT convert to transliteration.
- transliteration_lyrics: string — English phonetic transliteration of Malayalam if present, else null
- lyrics: string — English lyrics without chords if present, else null
- section_headers: array of section names found
- confidence_notes: string — note any low-confidence chords, handwritten corrections applied, or unclear parts
- source_type: "OCR Import"

## OTHER RULES
- Never fabricate content not visible in the image
- Preserve all chord symbols exactly: G, D/F#, F#m7, Asus, Cadd9, Am7, Bb, Eb, Gsus4, Bm, etc.
- Malayalam Unicode characters must be preserved exactly`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
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