/**
 * Layout engine. Turns a logical SymbolUnit into concrete geometry (body
 * rectangle + pin positions/angles) expressed in mil with a Y-up coordinate
 * system, matching KiCAD's symbol coordinate space. The same layout result
 * feeds both the SVG preview and the .kicad_sym generator so they never drift.
 */

import { GRID_MIL, snapMil } from './units'
import type {
  Pin,
  PinArrangement,
  PinSide,
  SymbolUnit,
} from './types'
import { PIN_SIDES } from './types'

/** Direction pins are walked around the body. */
export type PlacementDirection = 'default' | 'clockwise' | 'counter_clockwise'

export interface LayoutOptions {
  /** Pin spacing in mil (multiples of 100 recommended). */
  spacing: number
  /** Per-side ordering of pins. */
  arrangements: Record<PinSide, PinArrangement>
  /** Global walk direction mapped onto each side. */
  direction: PlacementDirection
  /** Pin name text height in mil (KiCAD default 50 mil = 1.27 mm). */
  nameFontSize: number
}

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  spacing: GRID_MIL,
  arrangements: {
    left: 'order',
    right: 'order',
    top: 'order',
    bottom: 'order',
  },
  direction: 'default',
  nameFontSize: 50,
}

export interface PinLayout {
  pin: Pin
  /** Connection-point (tip) coordinates in mil, Y up. */
  x: number
  y: number
  /** KiCAD pin orientation in degrees. */
  angle: 0 | 90 | 180 | 270
  side: PinSide
}

export interface UnitLayout {
  /** Body rectangle corners in mil, Y up. */
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
  pins: PinLayout[]
}

/** Approximate rendered width of a string at a given font size (mil). */
function textWidthMil(text: string, fontSize: number): number {
  // KiCAD's stroke font is roughly 0.6 em wide per glyph on average.
  return text.length * fontSize * 0.6
}

function sortPins(pins: Pin[], arrangement: PinArrangement): Pin[] {
  const copy = [...pins]
  switch (arrangement) {
    case 'order':
      return copy
    case 'number_asc':
      return copy.sort((a, b) => compareNumbers(a.number, b.number))
    case 'number_desc':
      return copy.sort((a, b) => compareNumbers(b.number, a.number))
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name))
  }
}

/** Numeric-aware comparison so "2" sorts before "10". */
function compareNumbers(a: string, b: string): number {
  const na = parseFloat(a)
  const nb = parseFloat(b)
  const aNum = !Number.isNaN(na)
  const bNum = !Number.isNaN(nb)
  if (aNum && bNum && na !== nb) return na - nb
  return a.localeCompare(b, undefined, { numeric: true })
}

/**
 * Whether the canonical position order for a side must be reversed to satisfy
 * the requested global walk direction. Canonical order is:
 *   left/right: top -> bottom, top/bottom: left -> right.
 */
function shouldReverse(side: PinSide, direction: PlacementDirection): boolean {
  if (direction === 'default') return false
  if (direction === 'clockwise') {
    return side === 'bottom' || side === 'left'
  }
  // counter_clockwise
  return side === 'top' || side === 'right'
}

function orderedForSide(
  pins: Pin[],
  side: PinSide,
  options: LayoutOptions,
): Pin[] {
  const sorted = sortPins(pins, options.arrangements[side])
  return shouldReverse(side, options.direction) ? sorted.reverse() : sorted
}

export function layoutUnit(
  unit: SymbolUnit,
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
): UnitLayout {
  const { spacing, nameFontSize } = options

  const bySide: Record<PinSide, Pin[]> = {
    left: [],
    right: [],
    top: [],
    bottom: [],
  }
  for (const pin of unit.pins) bySide[pin.side].push(pin)

  const ordered: Record<PinSide, Pin[]> = {
    left: orderedForSide(bySide.left, 'left', options),
    right: orderedForSide(bySide.right, 'right', options),
    top: orderedForSide(bySide.top, 'top', options),
    bottom: orderedForSide(bySide.bottom, 'bottom', options),
  }

  const count: Record<PinSide, number> = {
    left: ordered.left.length,
    right: ordered.right.length,
    top: ordered.top.length,
    bottom: ordered.bottom.length,
  }

  // Span occupied by pins along each axis.
  const maxVertical = Math.max(count.left, count.right)
  const maxHorizontal = Math.max(count.top, count.bottom)
  const spanV = Math.max(0, maxVertical - 1) * spacing
  const spanH = Math.max(0, maxHorizontal - 1) * spacing

  // Text room required inside the body.
  const leftText = maxNameWidth(ordered.left, nameFontSize)
  const rightText = maxNameWidth(ordered.right, nameFontSize)
  const topText = maxNameWidth(ordered.top, nameFontSize)
  const bottomText = maxNameWidth(ordered.bottom, nameFontSize)

  const margin = spacing
  const centerGap = spacing

  const widthFromPins = spanH + 2 * margin
  const widthFromText = leftText + rightText + centerGap + 2 * margin
  const heightFromPins = spanV + 2 * margin
  const heightFromText = topText + bottomText + centerGap + 2 * margin

  const minSize = 4 * spacing
  const width = snapUp(
    Math.max(minSize, widthFromPins, widthFromText),
    spacing,
  )
  const height = snapUp(
    Math.max(minSize, heightFromPins, heightFromText),
    spacing,
  )

  const halfW = width / 2
  const halfH = height / 2

  const pins: PinLayout[] = []

  // Left side: tip on the left, pin points right (angle 0).
  placeVertical(ordered.left, count.left, spacing, halfH, (pin, y) => {
    pins.push({ pin, x: -(halfW + pin.length), y, angle: 0, side: 'left' })
  })
  // Right side: tip on the right, pin points left (angle 180).
  placeVertical(ordered.right, count.right, spacing, halfH, (pin, y) => {
    pins.push({ pin, x: halfW + pin.length, y, angle: 180, side: 'right' })
  })
  // Top side: tip above, pin points down (angle 270).
  placeHorizontal(ordered.top, count.top, spacing, (pin, x) => {
    pins.push({ pin, x, y: halfH + pin.length, angle: 270, side: 'top' })
  })
  // Bottom side: tip below, pin points up (angle 90).
  placeHorizontal(ordered.bottom, count.bottom, spacing, (pin, x) => {
    pins.push({ pin, x, y: -(halfH + pin.length), angle: 90, side: 'bottom' })
  })

  return {
    left: -halfW,
    right: halfW,
    top: halfH,
    bottom: -halfH,
    width,
    height,
    pins,
  }
}

function maxNameWidth(pins: Pin[], fontSize: number): number {
  let max = 0
  for (const pin of pins) {
    if (pin.name === '~' || pin.name === '') continue
    max = Math.max(max, textWidthMil(pin.name, fontSize))
  }
  return max
}

/** Snap up to the next multiple of step. */
function snapUp(value: number, step: number): number {
  return Math.ceil(value / step) * step
}

function placeVertical(
  pins: Pin[],
  n: number,
  spacing: number,
  _halfH: number,
  emit: (pin: Pin, y: number) => void,
): void {
  if (n === 0) return
  const startY = ((n - 1) / 2) * spacing
  pins.forEach((pin, i) => {
    const y = snapMil(startY - i * spacing, 50)
    emit(pin, y)
  })
}

function placeHorizontal(
  pins: Pin[],
  n: number,
  spacing: number,
  emit: (pin: Pin, x: number) => void,
): void {
  if (n === 0) return
  const startX = -((n - 1) / 2) * spacing
  pins.forEach((pin, i) => {
    const x = snapMil(startX + i * spacing, 50)
    emit(pin, x)
  })
}

/** Layout every unit of a symbol. */
export function layoutAll(
  units: SymbolUnit[],
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
): UnitLayout[] {
  return units.map((u) => layoutUnit(u, options))
}

export { PIN_SIDES }
