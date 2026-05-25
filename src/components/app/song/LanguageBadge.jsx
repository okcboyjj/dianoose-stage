// Shared language badge used across Song Library, Global Catalog, My Library, etc.
export const LANG_BADGE = {
  Malayalam: { label: "ML", className: "bg-orange-500/15 text-orange-300 border-orange-500/25" },
  Mixed:     { label: "BI", className: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
  English:   { label: "EN", className: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
};

export default function LanguageBadge({ language, size = "sm" }) {
  if (!language || language === "English") return null;
  const cfg = LANG_BADGE[language] || LANG_BADGE["English"];
  return (
    <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 shrink-0 ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// Helper: get the best display title for a song (respects language)
export function getSongDisplayTitle(song) {
  if (song?.language === "Malayalam" && song?.malayalam_title) return song.malayalam_title;
  return song?.title || "";
}

export function getSongSubtitle(song) {
  if (song?.language === "Malayalam" || song?.language === "Mixed") {
    if (song?.transliteration_title) return song.transliteration_title;
    if (song?.language === "Malayalam" && song?.title) return song.title;
  }
  return song?.artist || "";
}

// Multilingual search matcher
export function songMatchesQuery(song, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    song?.title?.toLowerCase().includes(q) ||
    song?.malayalam_title?.toLowerCase().includes(q) ||
    song?.transliteration_title?.toLowerCase().includes(q) ||
    song?.artist?.toLowerCase().includes(q) ||
    song?.album?.toLowerCase().includes(q) ||
    (song?.tags || []).some(t => t.toLowerCase().includes(q))
  );
}

// Verified status badge config
export const VERIFIED_BADGE = {
  Verified:     { label: "✓ Verified",      className: "bg-green-500/15 text-green-300 border-green-500/25" },
  "Needs Review": { label: "⚠ Needs Review", className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25" },
  Unverified:   { label: "Unverified",       className: "bg-white/5 text-muted-foreground border-white/10" },
};