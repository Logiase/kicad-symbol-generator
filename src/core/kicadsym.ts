/**
 * Generates KiCAD `.kicad_sym` symbol library text (S-expressions) from a
 * SymbolDoc. Internal geometry is in mil and converted to mm here. KiCAD 10 is
 * the default target; older formats (7/8/9) are also supported and mainly
 * change the version token and the hide-flag syntax.
 */

import { layoutUnit, type LayoutOptions, type UnitLayout } from './layout'
import type { Pin, SymbolDoc } from './types'
import { formatMm } from './units'

export type KicadVersion = '7' | '8' | '9' | '10'

interface VersionInfo {
  version: number
  generatorVersion: string
  /** KiCAD <= 8 used the bare `hide` keyword instead of `(hide yes)`. */
  modernHide: boolean
}

export const KICAD_VERSIONS: Record<KicadVersion, VersionInfo> = {
  '7': { version: 20211014, generatorVersion: '7.0', modernHide: false },
  '8': { version: 20231120, generatorVersion: '8.0', modernHide: false },
  '9': { version: 20241209, generatorVersion: '9.0', modernHide: true },
  '10': { version: 20251024, generatorVersion: '10.0', modernHide: true },
}

export const DEFAULT_KICAD_VERSION: KicadVersion = '10'

const GENERATOR = 'kicad-symbol-generator'
const FONT_SIZE_MM = 1.27
const PIN_NAME_OFFSET_MM = 0.508

export interface GenerateOptions {
  version: KicadVersion
  layout: LayoutOptions
}

/** Escape a string for a KiCAD quoted token. */
function quote(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
  return `"${escaped}"`
}

/** Build a tab-indented line. */
function line(indent: number, text: string): string {
  return '\t'.repeat(indent) + text
}

function hideToken(modern: boolean): string {
  return modern ? '(hide yes)' : 'hide'
}

function effects(indent: number, hidden: boolean, modern: boolean): string[] {
  const out: string[] = []
  out.push(line(indent, '(effects'))
  out.push(line(indent + 1, `(font (size ${FONT_SIZE_MM} ${FONT_SIZE_MM}))`))
  if (hidden) out.push(line(indent + 1, hideToken(modern)))
  out.push(line(indent, ')'))
  return out
}

function property(
  indent: number,
  key: string,
  value: string,
  x: number,
  y: number,
  hidden: boolean,
  modern: boolean,
): string[] {
  const out: string[] = []
  out.push(line(indent, `(property ${quote(key)} ${quote(value)}`))
  out.push(line(indent + 1, `(at ${fmt(x)} ${fmt(y)} 0)`))
  out.push(...effects(indent + 1, hidden, modern))
  out.push(line(indent, ')'))
  return out
}

/** Format a mil coordinate as an mm string. */
function fmt(mil: number): string {
  return formatMm(mil)
}

function pinSExpr(
  indent: number,
  p: Pin,
  x: number,
  y: number,
  angle: number,
  modern: boolean,
): string[] {
  const out: string[] = []
  out.push(line(indent, `(pin ${p.electricalType} ${p.graphicStyle}`))
  out.push(line(indent + 1, `(at ${fmt(x)} ${fmt(y)} ${angle})`))
  out.push(line(indent + 1, `(length ${fmt(p.length)})`))
  if (p.hidden) out.push(line(indent + 1, hideToken(modern)))
  out.push(
    line(
      indent + 1,
      `(name ${quote(p.name || '~')} (effects (font (size ${FONT_SIZE_MM} ${FONT_SIZE_MM}))))`,
    ),
  )
  out.push(
    line(
      indent + 1,
      `(number ${quote(p.number || '~')} (effects (font (size ${FONT_SIZE_MM} ${FONT_SIZE_MM}))))`,
    ),
  )
  out.push(line(indent, ')'))
  return out
}

function unitSExpr(
  indent: number,
  symbolName: string,
  unitIndex: number,
  lay: UnitLayout,
  modern: boolean,
): string[] {
  const out: string[] = []
  const subName = `${symbolName}_${unitIndex + 1}_1`
  out.push(line(indent, `(symbol ${quote(subName)}`))

  // Body rectangle.
  out.push(line(indent + 1, '(rectangle'))
  out.push(line(indent + 2, `(start ${fmt(lay.left)} ${fmt(lay.top)})`))
  out.push(line(indent + 2, `(end ${fmt(lay.right)} ${fmt(lay.bottom)})`))
  out.push(line(indent + 2, '(stroke (width 0) (type default))'))
  out.push(line(indent + 2, '(fill (type background))'))
  out.push(line(indent + 1, ')'))

  for (const pl of lay.pins) {
    out.push(...pinSExpr(indent + 1, pl.pin, pl.x, pl.y, pl.angle, modern))
  }

  out.push(line(indent, ')'))
  return out
}

export function generateKicadSym(
  doc: SymbolDoc,
  options: GenerateOptions,
): string {
  const info = KICAD_VERSIONS[options.version]
  const modern = info.modernHide
  const out: string[] = []

  out.push('(kicad_symbol_lib')
  out.push(line(1, `(version ${info.version})`))
  out.push(line(1, `(generator ${quote(GENERATOR)})`))
  out.push(line(1, `(generator_version ${quote(info.generatorVersion)})`))

  const name = doc.name || 'NewSymbol'
  out.push(line(1, `(symbol ${quote(name)}`))

  if (!doc.showPinNumbers) {
    out.push(line(2, `(pin_numbers ${modern ? '(hide yes)' : 'hide'})`))
  }
  if (doc.showPinNames) {
    out.push(line(2, `(pin_names (offset ${PIN_NAME_OFFSET_MM}))`))
  } else {
    out.push(
      line(
        2,
        `(pin_names (offset ${PIN_NAME_OFFSET_MM}) ${modern ? '(hide yes)' : 'hide'})`,
      ),
    )
  }
  out.push(line(2, '(exclude_from_sim no)'))
  out.push(line(2, '(in_bom yes)'))
  out.push(line(2, '(on_board yes)'))

  // Place Reference above and Value below using the first unit's body.
  const firstLayout =
    doc.units.length > 0
      ? layoutUnit(doc.units[0], options.layout)
      : null
  const refY = firstLayout ? firstLayout.top + 50 : 100
  const valY = firstLayout ? firstLayout.bottom - 50 : -100

  out.push(...property(2, 'Reference', doc.reference || 'U', 0, refY, false, modern))
  out.push(...property(2, 'Value', name, 0, valY, false, modern))
  out.push(...property(2, 'Footprint', doc.footprint, 0, 0, true, modern))
  out.push(...property(2, 'Datasheet', doc.datasheet, 0, 0, true, modern))
  out.push(...property(2, 'Description', doc.description, 0, 0, true, modern))

  doc.units.forEach((unit, i) => {
    const lay = layoutUnit(unit, options.layout)
    out.push(...unitSExpr(2, name, i, lay, modern))
  })

  out.push(line(1, ')'))
  out.push(')')
  out.push('')

  return out.join('\n')
}
