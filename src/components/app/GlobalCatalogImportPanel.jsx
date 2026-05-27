import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Database, Loader2, Play, ShieldCheck } from "lucide-react";

const starterJson = `{
  "playlists": [
    {
      "id": "37i9dQZF1DWVlWpJblBvap",
      "label": "Spotify Worship Hits",
      "category": "Worship",
      "tags": ["worship-hits"]
    },
    {
      "id": "37i9dQZF1DXcb6CQIjdqKy",
      "label": "Spotify Top Christian & Gospel",
      "category": "Worship",
      "tags": ["christian-gospel"]
    },
    {
      "id": "23f0nEON2rmMQTCsYPZ8sc",
      "label": "PraiseCharts Top 100 Worship Songs of All Time",
      "category": "Worship",
      "tags": ["praisecharts", "worship-classics"]
    },
    {
      "id": "1OKjoeUaByvyv5AwzHX2R3",
      "label": "PraiseCharts Top New Praise & Worship Songs",
      "category": "Worship",
      "tags": ["praisecharts", "new-worship"]
    },
    {
      "id": "51QA9N3auAnh3qkC7vkUVx",
      "label": "Top 40 Worship Songs CCLI May 2026",
      "category": "Worship",
      "tags": ["ccli", "top-worship-2026"]
    },
    {
      "id": "4CajS0j0UugrSHDTNJddZ9",
      "label": "CCLI 2020s Top 100 Worship Songs",
      "category": "Worship",
      "tags": ["ccli", "2020s-worship"]
    }
  ],
  "songs": []
}`;

export default function GlobalCatalogImportPanel() {
  const [raw, setRaw] = useState(starterJson);
  const [dryRun, setDryRun] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const parsed = useMemo(() => {
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return { songs: data, playlists: [] };
      return {
        songs: Array.isArray(data?.songs) ? data.songs : [],
        playlists: Array.isArray(data?.playlists) ? data.playlists : [],
      };
    } catch {
      return { songs: [], playlists: [] };
    }
  }, [raw]);

  const importCount = parsed.songs.length + parsed.playlists.length;

  const runImport = async () => {
    setRunning(true);
    setError("");
    setResult(null);

    try {
      const res = await base44.functions.invoke("bulkImportGlobalSongs", {
        songs: parsed.songs,
        playlists: parsed.playlists,
        dry_run: dryRun,
        limit: 500,
      });
      setResult(res?.data ?? res);
    } catch (err) {
      setError(err?.message || "Import failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Global Catalog Import</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Admin tool for importing Spotify playlist tracks or seed songs into the global catalog. Low-confidence seed matches are skipped.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5 w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          Spotify-only artwork
        </div>
      </div>

      <Textarea
        value={raw}
        onChange={e => setRaw(e.target.value)}
        rows={9}
        className="bg-background/60 border-border/60 font-mono text-xs resize-y"
        placeholder="Paste a JSON array of seed songs here..."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={e => setDryRun(e.target.checked)}
            className="accent-primary"
          />
          Dry run first
        </label>
        <Button
          onClick={runImport}
          disabled={running || importCount === 0}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {dryRun ? `Test Batch` : `Import Batch`}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-xs p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-white/10 bg-background/50 p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-lg font-bold text-foreground">{result.imported_count || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Imported</p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-lg font-bold text-foreground">{result.skipped_count || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Skipped</p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-lg font-bold text-foreground">{result.failed_count || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Failed</p>
            </div>
          </div>
          <pre className="max-h-64 overflow-auto rounded-lg bg-black/30 p-3 text-[11px] text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
