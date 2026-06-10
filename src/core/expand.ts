/**
 * Pattern expansion for bulk pin creation and renaming.
 *
 * A pattern may contain one or more range tokens of the form `[start..end]`.
 * Each range expands to a sequence of integers (ascending or descending), and
 * the cartesian-free, lock-step expansion is performed: when several ranges are
 * present they must all have the same length and advance together.
 *
 * Examples:
 *   "PIN_[0..63]"        -> PIN_0, PIN_1, ... PIN_63
 *   "PORT[0..31]_IN"     -> PORT0_IN, ... PORT31_IN
 *   "D[7..0]"            -> D7, D6, ... D0
 *   "GPIO[0..3]_[A..]"   -> (only numeric ranges supported)
 *   "VCC"                -> VCC (no range -> single value)
 *   "A[0..1]B[0..1]"     -> A0B0, A1B1 (lock-step, equal lengths)
 *
 * Optional zero padding: `[00..15]` pads numbers to the width of the start
 * token (e.g. PIN_00 .. PIN_15).
 */

const RANGE_RE = /\[(-?\d+)\.\.(-?\d+)\]/g

export interface ExpandSuccess {
  ok: true
  values: string[]
}

export interface ExpandError {
  ok: false
  /** i18n key describing the failure. */
  errorKey: ExpandErrorKey
  /** Extra params for message interpolation. */
  params?: Record<string, string | number>
}

export type ExpandErrorKey =
  | 'expand.error.rangeLengthMismatch'
  | 'expand.error.empty'

export type ExpandResult = ExpandSuccess | ExpandError

interface RangeToken {
  start: number
  end: number
  width: number
  values: string[]
}

function parseRanges(pattern: string): RangeToken[] {
  const tokens: RangeToken[] = []
  for (const match of pattern.matchAll(RANGE_RE)) {
    const startRaw = match[1]
    const endRaw = match[2]
    const start = parseInt(startRaw, 10)
    const end = parseInt(endRaw, 10)
    // Zero padding width is taken from the start token (ignoring a leading sign).
    const width = startRaw.replace('-', '').length
    const values: string[] = []
    const step = start <= end ? 1 : -1
    for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
      values.push(formatNumber(n, width))
    }
    tokens.push({ start, end, width, values })
  }
  return tokens
}

function formatNumber(n: number, width: number): string {
  const negative = n < 0
  const digits = Math.abs(n).toString().padStart(width, '0')
  return negative ? `-${digits}` : digits
}

/**
 * Expand a single pattern into a list of strings. Returns a discriminated
 * result so callers can surface precise validation errors.
 */
export function expandPattern(pattern: string): ExpandResult {
  const trimmed = pattern
  const ranges = parseRanges(trimmed)

  if (ranges.length === 0) {
    const value = trimmed
    if (value.length === 0) {
      return { ok: false, errorKey: 'expand.error.empty' }
    }
    return { ok: true, values: [value] }
  }

  const length = ranges[0].values.length
  for (const range of ranges) {
    if (range.values.length !== length) {
      return {
        ok: false,
        errorKey: 'expand.error.rangeLengthMismatch',
      }
    }
  }

  const values: string[] = []
  for (let i = 0; i < length; i++) {
    let result = ''
    let lastIndex = 0
    let rangeIdx = 0
    // Re-run the regex to splice each range's i-th value back into place.
    RANGE_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = RANGE_RE.exec(trimmed)) !== null) {
      result += trimmed.slice(lastIndex, m.index)
      result += ranges[rangeIdx].values[i]
      lastIndex = m.index + m[0].length
      rangeIdx++
    }
    result += trimmed.slice(lastIndex)
    values.push(result)
  }

  return { ok: true, values }
}

/** Convenience helper that returns [] on error (for previews). */
export function expandPatternOrEmpty(pattern: string): string[] {
  const result = expandPattern(pattern)
  return result.ok ? result.values : []
}

/** True when the pattern contains at least one range token. */
export function hasRange(pattern: string): boolean {
  RANGE_RE.lastIndex = 0
  return RANGE_RE.test(pattern)
}
