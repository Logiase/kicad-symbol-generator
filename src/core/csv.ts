/**
 * CSV import/export compatible with the kipart tool.
 *
 * Layout written:
 *   <PartName>
 *   Pin,Name,Type,Side,Unit,Style,Hidden
 *   1,GPIO0,input,left,1,line,
 *   ...
 *
 * Import is tolerant: it finds the header row by recognised column labels,
 * matches columns case-insensitively in any order, treats the single-cell row
 * above the header as the part name, and fills sensible defaults for missing
 * columns. Type/side/style values are normalised so kipart files load cleanly.
 */

import { createId } from './id'
import type {
  Pin,
  PinElectricalType,
  PinGraphicStyle,
  PinSide,
  SymbolUnit,
} from './types'
import {
  PIN_ELECTRICAL_TYPES,
  PIN_GRAPHIC_STYLES,
} from './types'

export interface CsvImportResult {
  name: string
  units: SymbolUnit[]
}

export interface CsvImportError {
  errorKey: 'csv.error.noHeader' | 'csv.error.empty'
}

const HEADER = ['Pin', 'Name', 'Type', 'Side', 'Unit', 'Style', 'Hidden']

const TYPE_ALIASES: Record<string, PinElectricalType> = {
  in: 'input',
  out: 'output',
  bidi: 'bidirectional',
  bi: 'bidirectional',
  tristate: 'tri_state',
  '3state': 'tri_state',
  tri_state: 'tri_state',
  pwr: 'power_in',
  power: 'power_in',
  power_in: 'power_in',
  power_out: 'power_out',
  nc: 'no_connect',
  no_connect: 'no_connect',
  oc: 'open_collector',
  oe: 'open_emitter',
}

const SIDE_ALIASES: Record<string, PinSide> = {
  l: 'left',
  r: 'right',
  t: 'top',
  b: 'bottom',
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
}

const DEFAULT_PIN: Omit<Pin, 'id' | 'number' | 'name'> = {
  electricalType: 'passive',
  graphicStyle: 'line',
  side: 'left',
  hidden: false,
  length: 100,
}

// --- CSV primitives -------------------------------------------------------

/** Parse CSV text into rows of cells, honouring quotes and escaped quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  row.push(cell)
  rows.push(row)
  return rows
}

/** Quote a cell if it contains a comma, quote or newline. */
function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function csvRow(cells: string[]): string {
  return cells.map(csvCell).join(',')
}

// --- Export ---------------------------------------------------------------

export function exportCsv(name: string, units: SymbolUnit[]): string {
  const lines: string[] = []
  lines.push(csvRow([name]))
  lines.push(csvRow(HEADER))
  units.forEach((unit, unitIndex) => {
    for (const pin of unit.pins) {
      lines.push(
        csvRow([
          pin.number,
          pin.name,
          exportType(pin.electricalType),
          pin.side,
          String(unitIndex + 1),
          pin.graphicStyle,
          pin.hidden ? 'Y' : '',
        ]),
      )
    }
  })
  lines.push('')
  return lines.join('\n')
}

function exportType(type: PinElectricalType): string {
  return type === 'tri_state' ? 'tristate' : type
}

// --- Import ---------------------------------------------------------------

export function importCsv(
  text: string,
): CsvImportResult | CsvImportError {
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ''))
  if (rows.length === 0) return { errorKey: 'csv.error.empty' }

  const headerIndex = rows.findIndex(isHeaderRow)
  if (headerIndex === -1) return { errorKey: 'csv.error.noHeader' }

  // Part name: the most recent single-cell row above the header, else first row.
  let name = 'ImportedSymbol'
  for (let i = headerIndex - 1; i >= 0; i--) {
    const nonEmpty = rows[i].filter((c) => c.trim() !== '')
    if (nonEmpty.length >= 1) {
      name = nonEmpty[0].trim()
      break
    }
  }

  const header = rows[headerIndex].map((c) => c.trim().toLowerCase())
  const col = (key: string) => header.indexOf(key)
  const idx = {
    pin: col('pin'),
    name: col('name'),
    type: col('type'),
    side: col('side'),
    unit: col('unit'),
    style: col('style'),
    hidden: col('hidden'),
  }

  const unitMap = new Map<string, Pin[]>()
  const unitOrder: string[] = []

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const r = rows[i]
    const get = (c: number) => (c >= 0 && c < r.length ? r[c].trim() : '')
    const unitKey = get(idx.unit) || '1'
    if (!unitMap.has(unitKey)) {
      unitMap.set(unitKey, [])
      unitOrder.push(unitKey)
    }
    unitMap.get(unitKey)!.push({
      id: createId(),
      number: get(idx.pin),
      name: get(idx.name) || '~',
      electricalType: normalizeType(get(idx.type)),
      graphicStyle: normalizeStyle(get(idx.style)),
      side: normalizeSide(get(idx.side)),
      hidden: parseHidden(get(idx.hidden)),
      length: DEFAULT_PIN.length,
    })
  }

  const sortedKeys = [...unitOrder].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )
  const units: SymbolUnit[] = sortedKeys.map((key, i) => ({
    id: createId(),
    name: `Unit ${i + 1}`,
    pins: unitMap.get(key)!,
  }))

  return { name, units }
}

function isHeaderRow(row: string[]): boolean {
  const cells = row.map((c) => c.trim().toLowerCase())
  return cells.includes('pin') && cells.includes('name')
}

function normalizeType(raw: string): PinElectricalType {
  const v = raw.trim().toLowerCase().replace(/[\s-]/g, '_')
  if ((PIN_ELECTRICAL_TYPES as string[]).includes(v)) {
    return v as PinElectricalType
  }
  return TYPE_ALIASES[v] ?? DEFAULT_PIN.electricalType
}

function normalizeStyle(raw: string): PinGraphicStyle {
  const v = raw.trim().toLowerCase().replace(/[\s-]/g, '_')
  if ((PIN_GRAPHIC_STYLES as string[]).includes(v)) {
    return v as PinGraphicStyle
  }
  return DEFAULT_PIN.graphicStyle
}

function normalizeSide(raw: string): PinSide {
  const v = raw.trim().toLowerCase()
  return SIDE_ALIASES[v] ?? DEFAULT_PIN.side
}

function parseHidden(raw: string): boolean {
  const v = raw.trim().toLowerCase()
  return v === 'y' || v === 'yes' || v === 'true' || v === '1' || v === 'hidden'
}
