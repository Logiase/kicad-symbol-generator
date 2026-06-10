/**
 * Unit conversions. The whole application works internally in mil (1/1000 inch)
 * so that everything snaps cleanly to KiCAD's 50/100 mil grid. KiCAD symbol
 * files store coordinates in millimetres, so conversion happens only at export.
 */

export const MIL_PER_MM = 1 / 0.0254
export const MM_PER_MIL = 0.0254

/** Default grid step pins must align to, in mil. */
export const GRID_MIL = 100

/** Convert a length in mil to mm, rounded to a sane precision for KiCAD. */
export function milToMm(mil: number): number {
  return round(mil * MM_PER_MIL, 4)
}

/** Snap a value in mil to the nearest multiple of `step` (default 100 mil). */
export function snapMil(valueMil: number, step: number = GRID_MIL): number {
  return Math.round(valueMil / step) * step
}

/** Round to a fixed number of decimal places, avoiding -0 output. */
export function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  const result = Math.round(value * factor) / factor
  return result === 0 ? 0 : result
}

/** Format an mm number the way KiCAD writes them (trimmed, no trailing zeros). */
export function formatMm(mil: number): string {
  const mm = milToMm(mil)
  // KiCAD writes integers without a decimal point and trims trailing zeros.
  return String(mm)
}
