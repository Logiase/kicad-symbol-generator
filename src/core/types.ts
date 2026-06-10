/**
 * Core domain model for a KiCAD symbol. These types are pure data with no UI or
 * React dependencies so they can be unit tested and reused by every layer
 * (layout, SVG, .kicad_sym generation, CSV import/export).
 */

/** The four sides of the symbol body a pin can attach to. */
export type PinSide = 'left' | 'right' | 'top' | 'bottom'

/** KiCAD electrical pin types. */
export type PinElectricalType =
  | 'input'
  | 'output'
  | 'bidirectional'
  | 'tri_state'
  | 'passive'
  | 'free'
  | 'unspecified'
  | 'power_in'
  | 'power_out'
  | 'open_collector'
  | 'open_emitter'
  | 'no_connect'

/** KiCAD pin graphic styles. */
export type PinGraphicStyle =
  | 'line'
  | 'inverted'
  | 'clock'
  | 'inverted_clock'
  | 'input_low'
  | 'clock_low'
  | 'output_low'
  | 'edge_clock_high'
  | 'non_logic'

/** How pins on a given side are ordered when laid out. */
export type PinArrangement =
  | 'order' // keep the order pins appear in the list
  | 'number_asc' // sort by numeric pin number ascending
  | 'number_desc'
  | 'name_asc'
  | 'name_desc'

export interface Pin {
  id: string
  /** Pin number / designator, e.g. "1", "A12". Kept as a string on purpose. */
  number: string
  name: string
  electricalType: PinElectricalType
  graphicStyle: PinGraphicStyle
  side: PinSide
  hidden: boolean
  /** Pin stub length in mil. */
  length: number
}

export interface SymbolUnit {
  id: string
  /** Human readable name for the unit (UI only). */
  name: string
  pins: Pin[]
}

export interface SymbolDoc {
  name: string
  reference: string
  value: string
  footprint: string
  datasheet: string
  description: string
  /** Show the pin name/number text in the generated symbol. */
  showPinNames: boolean
  showPinNumbers: boolean
  units: SymbolUnit[]
}

export const PIN_SIDES: PinSide[] = ['left', 'right', 'top', 'bottom']

export const PIN_ELECTRICAL_TYPES: PinElectricalType[] = [
  'input',
  'output',
  'bidirectional',
  'tri_state',
  'passive',
  'free',
  'unspecified',
  'power_in',
  'power_out',
  'open_collector',
  'open_emitter',
  'no_connect',
]

export const PIN_GRAPHIC_STYLES: PinGraphicStyle[] = [
  'line',
  'inverted',
  'clock',
  'inverted_clock',
  'input_low',
  'clock_low',
  'output_low',
  'edge_clock_high',
  'non_logic',
]

export const PIN_ARRANGEMENTS: PinArrangement[] = [
  'order',
  'number_asc',
  'number_desc',
  'name_asc',
  'name_desc',
]
