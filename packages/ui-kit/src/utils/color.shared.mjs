/** Shared by the source library, token validator and theme builder. No DOM or Vue. */
export function normalizeHex(value) {
  const text = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  if (/^#[0-9a-f]{3}$/.test(text)) return "#" + Array.from(text.slice(1), (part) => part + part).join("");
  return null;
}

export function contrastRatio(foreground, background) {
  function luminance(value) {
    const hex = normalizeHex(value);
    if (!hex) throw new TypeError(`Contrast color must be an opaque hex value: ${value}`);
    const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
      .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
