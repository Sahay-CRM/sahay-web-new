/**
 * Determines if a hex color is dark.
 * @param color - Hex color string (e.g., "#c40000")
 * @returns true if color is dark, false otherwise
 */
export function isColorDark(color: string): boolean {
  // Remove hash if present
  const hex = color.replace(/^#/, "");

  // Parse r, g, b values
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    // Invalid format
    return false;
  }

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // If luminance is less than 0.5, it's dark
  return luminance < 0.5;
}

/**
 * Adjusts a hex color to be readable on a light background.
 * If the color is too light, it returns a darkened version.
 * @param color - Hex color string
 * @returns A contrast-safe color for text on a white/light background
 */
export function adjustColorForText(color?: string): string | undefined {
  if (!color) return color;
  const lower = color.toLowerCase().trim();

  // Known status colors mapping
  const map: Record<string, string> = {
    // "#3bfef8": "#0284c7", // In Progress -> Darker Sky Blue
  };

  if (map[lower]) return map[lower];

  // Parse color and check if it is dark
  const isDark = isColorDark(color);
  if (!isDark) {
    // Darken the color
    const hex = color.replace(/^#/, "");
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return color;
    }

    const darken = (val: number) => Math.max(0, Math.min(255, Math.floor(val * 0.6)));
    const darkR = darken(r).toString(16).padStart(2, "0");
    const darkG = darken(g).toString(16).padStart(2, "0");
    const darkB = darken(b).toString(16).padStart(2, "0");
    return `#${darkR}${darkG}${darkB}`;
  }

  return color;
}

