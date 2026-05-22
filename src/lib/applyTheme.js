/**
 * Converts a hex color string to HSL components string (e.g. "243.5 100% 69.4%")
 */
function hexToHsl(hex) {
  if (!hex) return null;
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

/**
 * Applies church accent/glow colors to CSS variables on :root
 */
export function applyChurchTheme(church) {
  if (!church) return;
  const root = document.documentElement;

  if (church.accent_color) {
    const hsl = hexToHsl(church.accent_color);
    if (hsl) root.style.setProperty("--primary", hsl);
  }

  if (church.glow_color) {
    const hsl = hexToHsl(church.glow_color);
    if (hsl) root.style.setProperty("--accent", hsl);
  }
}