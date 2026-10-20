export interface PickerHsva { h: number; s: number; v: number; a: number }
export function normalizePickerColor(value: string, alpha: boolean): string | null {
  let hex = value.trim().replace(/^#/, "").toLowerCase();
  if (!/^[0-9a-f]+$/.test(hex) || ![3, 6, ...(alpha ? [4, 8] : [])].includes(hex.length)) return null;
  if (hex.length === 3 || hex.length === 4) hex = [...hex].map((digit) => digit + digit).join("");
  if (alpha && hex.length === 6) hex += "ff";
  return `#${hex}`;
}
export function pickerHsva(value: string): PickerHsva {
  const hex = normalizePickerColor(value, true) ?? "#000000ff";
  const channels = [1, 3, 5, 7].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b, a] = channels as [number, number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const hue = delta === 0 ? 0 : max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: ((hue * 60) + 360) % 360, s: max === 0 ? 0 : delta / max, v: max, a };
}
export function pickerHex(hsva: PickerHsva, alpha: boolean): string {
  const h = ((hsva.h % 360) + 360) % 360 / 60;
  const c = hsva.v * hsva.s;
  const x = c * (1 - Math.abs(h % 2 - 1));
  const offset = hsva.v - c;
  const rgb = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
  if (alpha) rgb.push(hsva.a);
  return `#${rgb.map((channel, index) => Math.round(Math.max(0, Math.min(1, channel + (index < 3 ? offset : 0))) * 255).toString(16).padStart(2, "0")).join("")}`;
}
