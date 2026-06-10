/**
 * Renders a UnitLayout to an SVG string. Geometry comes from the layout engine
 * (mil, Y up); here we flip Y for SVG's Y-down space, keep text upright, and
 * draw pins, decorations (inverted/clock), pin names (inside) and numbers.
 *
 * Colours follow KiCAD's familiar scheme: dark-red body/pins, teal pin names,
 * red pin numbers, so the preview reads like the symbol editor.
 */

import type { PinLayout, UnitLayout } from './layout'
import type { PinGraphicStyle } from './types'

export interface SvgColors {
  outline: string
  fill: string
  pin: string
  name: string
  number: string
  hidden: string
}

export const KICAD_COLORS: SvgColors = {
  outline: '#840000',
  fill: '#FFFFC2',
  pin: '#840000',
  name: '#008484',
  number: '#840000',
  hidden: '#9a9a9a',
}

export interface SvgRenderOptions {
  fontSize: number
  nameOffset: number
  showNames: boolean
  showNumbers: boolean
  colors: SvgColors
  padding: number
}

export const DEFAULT_SVG_OPTIONS: SvgRenderOptions = {
  fontSize: 50,
  nameOffset: 20,
  showNames: true,
  showNumbers: true,
  colors: KICAD_COLORS,
  padding: 120,
}

export interface SvgResult {
  svg: string
  viewBox: string
  minX: number
  minY: number
  width: number
  height: number
}

interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

function xml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Inner SVG body-edge point for a pin (where stub meets the rectangle). */
function bodyEdge(pl: PinLayout): { x: number; y: number } {
  switch (pl.side) {
    case 'left':
      return { x: pl.x + pl.pin.length, y: pl.y }
    case 'right':
      return { x: pl.x - pl.pin.length, y: pl.y }
    case 'top':
      return { x: pl.x, y: pl.y - pl.pin.length }
    case 'bottom':
      return { x: pl.x, y: pl.y + pl.pin.length }
  }
}

const INVERTED_STYLES: PinGraphicStyle[] = [
  'inverted',
  'inverted_clock',
]
const CLOCK_STYLES: PinGraphicStyle[] = [
  'clock',
  'inverted_clock',
  'clock_low',
  'edge_clock_high',
]

export function renderUnitSvg(
  layout: UnitLayout,
  options: SvgRenderOptions = DEFAULT_SVG_OPTIONS,
): SvgResult {
  const parts: string[] = []
  const bounds: Bounds = {
    minX: layout.left,
    minY: -layout.top,
    maxX: layout.right,
    maxY: -layout.bottom,
  }

  // Body rectangle (flip Y: svgY = -y).
  const rx = layout.left
  const ry = -layout.top
  const rw = layout.width
  const rh = layout.height
  parts.push(
    `<rect x="${n(rx)}" y="${n(ry)}" width="${n(rw)}" height="${n(rh)}" ` +
      `fill="${options.colors.fill}" stroke="${options.colors.outline}" stroke-width="6" />`,
  )

  for (const pl of layout.pins) {
    parts.push(...renderPin(pl, options, bounds))
  }

  const minX = bounds.minX - options.padding
  const minY = bounds.minY - options.padding
  const width = bounds.maxX - bounds.minX + options.padding * 2
  const height = bounds.maxY - bounds.minY + options.padding * 2
  const viewBox = `${n(minX)} ${n(minY)} ${n(width)} ${n(height)}`

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ` +
    `font-family="monospace">\n${parts.join('\n')}\n</svg>`

  return { svg, viewBox, minX, minY, width, height }
}

function renderPin(
  pl: PinLayout,
  options: SvgRenderOptions,
  bounds: Bounds,
): string[] {
  const out: string[] = []
  const color = pl.pin.hidden ? options.colors.hidden : options.colors.pin
  const nameColor = pl.pin.hidden ? options.colors.hidden : options.colors.name
  const numColor = pl.pin.hidden ? options.colors.hidden : options.colors.number

  const tipX = pl.x
  const tipY = -pl.y
  const edge = bodyEdge(pl)
  const edgeX = edge.x
  const edgeY = -edge.y

  // Pin stub.
  out.push(
    `<line x1="${n(tipX)}" y1="${n(tipY)}" x2="${n(edgeX)}" y2="${n(edgeY)}" ` +
      `stroke="${color}" stroke-width="6" />`,
  )
  grow(bounds, tipX, tipY)
  grow(bounds, edgeX, edgeY)

  // Graphic-style decorations near the body edge.
  if (INVERTED_STYLES.includes(pl.pin.graphicStyle)) {
    const r = 12
    const cx = edgeX + dirX(pl) * r
    const cy = edgeY + dirY(pl) * r
    out.push(
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="none" ` +
        `stroke="${color}" stroke-width="5" />`,
    )
  }
  if (CLOCK_STYLES.includes(pl.pin.graphicStyle)) {
    out.push(clockTriangle(pl, edgeX, edgeY, color))
  }

  // Pin name (inside the body).
  if (options.showNames && pl.pin.name && pl.pin.name !== '~') {
    out.push(pinNameText(pl, edgeX, edgeY, options, nameColor))
  }

  // Pin number (above the stub).
  if (options.showNumbers && pl.pin.number) {
    out.push(pinNumberText(pl, tipX, tipY, edgeX, edgeY, options, numColor))
  }

  return out
}

/** Unit vector pointing from the body edge outward (toward the tip). */
function dirX(pl: PinLayout): number {
  if (pl.side === 'left') return -1
  if (pl.side === 'right') return 1
  return 0
}
function dirY(pl: PinLayout): number {
  // SVG Y-down.
  if (pl.side === 'top') return -1
  if (pl.side === 'bottom') return 1
  return 0
}

function clockTriangle(
  pl: PinLayout,
  edgeX: number,
  edgeY: number,
  color: string,
): string {
  const s = 16
  let pts: string
  if (pl.side === 'left' || pl.side === 'right') {
    const inward = pl.side === 'left' ? 1 : -1
    pts = `${n(edgeX)},${n(edgeY - s)} ${n(edgeX + inward * s)},${n(edgeY)} ${n(edgeX)},${n(edgeY + s)}`
  } else {
    const inward = pl.side === 'top' ? 1 : -1
    pts = `${n(edgeX - s)},${n(edgeY)} ${n(edgeX)},${n(edgeY + inward * s)} ${n(edgeX + s)},${n(edgeY)}`
  }
  return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="5" />`
}

function pinNameText(
  pl: PinLayout,
  edgeX: number,
  edgeY: number,
  options: SvgRenderOptions,
  color: string,
): string {
  const fs = options.fontSize
  const off = options.nameOffset
  const t = xml(pl.pin.name)
  switch (pl.side) {
    case 'left':
      return text(edgeX + off, edgeY, t, fs, color, 'start', 'central')
    case 'right':
      return text(edgeX - off, edgeY, t, fs, color, 'end', 'central')
    case 'top': {
      // Name reads upward and extends down into the body (SVG +y).
      const py = edgeY + off
      return text(
        edgeX,
        py,
        t,
        fs,
        color,
        'end',
        'central',
        `rotate(-90 ${n(edgeX)} ${n(py)})`,
      )
    }
    case 'bottom': {
      // Name reads upward and extends up into the body (SVG -y).
      const py = edgeY - off
      return text(
        edgeX,
        py,
        t,
        fs,
        color,
        'start',
        'central',
        `rotate(-90 ${n(edgeX)} ${n(py)})`,
      )
    }
  }
}

function pinNumberText(
  pl: PinLayout,
  tipX: number,
  tipY: number,
  edgeX: number,
  edgeY: number,
  options: SvgRenderOptions,
  color: string,
): string {
  const fs = Math.round(options.fontSize * 0.85)
  const midX = (tipX + edgeX) / 2
  const midY = (tipY + edgeY) / 2
  const gap = 16
  const t = xml(pl.pin.number)
  if (pl.side === 'left' || pl.side === 'right') {
    return text(midX, midY - gap, t, fs, color, 'middle', 'baseline')
  }
  // Vertical stub: place number to the left, rotated.
  return text(
    midX - gap,
    midY,
    t,
    fs,
    color,
    'middle',
    'baseline',
    `rotate(-90 ${n(midX - gap)} ${n(midY)})`,
  )
}

function text(
  x: number,
  y: number,
  content: string,
  fontSize: number,
  color: string,
  anchor: string,
  baseline: string,
  transform?: string,
): string {
  const tf = transform ? ` transform="${transform}"` : ''
  return (
    `<text x="${n(x)}" y="${n(y)}" font-size="${fontSize}" fill="${color}" ` +
    `text-anchor="${anchor}" dominant-baseline="${baseline}"${tf}>${content}</text>`
  )
}

function grow(b: Bounds, x: number, y: number): void {
  b.minX = Math.min(b.minX, x)
  b.minY = Math.min(b.minY, y)
  b.maxX = Math.max(b.maxX, x)
  b.maxY = Math.max(b.maxY, y)
}

/** Format a number for SVG output (trim noise). */
function n(value: number): string {
  return String(Math.round(value * 100) / 100)
}
