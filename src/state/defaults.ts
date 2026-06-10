import { createId } from '../core/id'
import { DEFAULT_LAYOUT_OPTIONS, type LayoutOptions } from '../core/layout'
import { DEFAULT_KICAD_VERSION, type KicadVersion } from '../core/kicadsym'
import type { Pin, SymbolDoc, SymbolUnit } from '../core/types'

export const DEFAULT_PIN_LENGTH = 100

export function makePin(overrides: Partial<Pin> = {}): Pin {
  return {
    id: createId(),
    number: '',
    name: '~',
    electricalType: 'passive',
    graphicStyle: 'line',
    side: 'left',
    hidden: false,
    length: DEFAULT_PIN_LENGTH,
    ...overrides,
  }
}

export function makeUnit(name: string, pins: Pin[] = []): SymbolUnit {
  return { id: createId(), name, pins }
}

/** A small example symbol so the app shows something useful on first load. */
export function createDefaultDoc(): SymbolDoc {
  return {
    name: 'MyChip',
    reference: 'U',
    value: 'MyChip',
    footprint: '',
    datasheet: '',
    description: '',
    showPinNames: true,
    showPinNumbers: true,
    units: [
      makeUnit('Unit 1', [
        makePin({ number: '1', name: 'IN', electricalType: 'input', side: 'left' }),
        makePin({ number: '2', name: 'OUT', electricalType: 'output', side: 'right' }),
        makePin({ number: '3', name: 'VCC', electricalType: 'power_in', side: 'top' }),
        makePin({ number: '4', name: 'GND', electricalType: 'power_in', side: 'bottom' }),
      ]),
    ],
  }
}

export interface AppState {
  doc: SymbolDoc
  activeUnitId: string
  selectedPinIds: string[]
  layout: LayoutOptions
  version: KicadVersion
}

export function createDefaultState(): AppState {
  const doc = createDefaultDoc()
  return {
    doc,
    activeUnitId: doc.units[0].id,
    selectedPinIds: [],
    layout: DEFAULT_LAYOUT_OPTIONS,
    version: DEFAULT_KICAD_VERSION,
  }
}
