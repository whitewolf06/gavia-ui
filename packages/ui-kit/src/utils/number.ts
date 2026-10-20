/** Use a finite numeric input or the caller's explicit fallback. */
export function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, finiteOr(value, min)));
}

/** A bounded percentage, including ranges whose finite endpoints overflow subtraction. */
export function toPercent(value: number, min: number, max: number): number {
  if (!(max > min)) return 0;
  const current = clamp(value, min, max);
  const span = max - min;
  const share = Number.isFinite(span)
    ? (current - min) / span
    : (current / 2 - min / 2) / (max / 2 - min / 2);
  return clamp(share * 100, 0, 100);
}

export function roundToStep(value: number, step: number, min = 0): number {
  const increment = finiteOr(step, 1);
  if (increment <= 0) return finiteOr(value, min);
  const result = min + Math.round((finiteOr(value, min) - min) / increment) * increment;
  return Number.isFinite(result) ? Number(result.toPrecision(15)) : finiteOr(value, min);
}
