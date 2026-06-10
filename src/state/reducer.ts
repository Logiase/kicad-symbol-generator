import type { LayoutOptions, PlacementDirection } from '../core/layout'
import type { KicadVersion } from '../core/kicadsym'
import type {
  Pin,
  PinArrangement,
  PinSide,
  SymbolDoc,
  SymbolUnit,
} from '../core/types'
import { createDefaultState, makePin, makeUnit, type AppState } from './defaults'

type DocScalarKey = 'name' | 'reference' | 'value' | 'footprint' | 'datasheet' | 'description'

export type Action =
  | { type: 'setDocField'; key: DocScalarKey; value: string }
  | { type: 'setShowPinNames'; value: boolean }
  | { type: 'setShowPinNumbers'; value: boolean }
  | { type: 'addUnit' }
  | { type: 'removeUnit'; unitId: string }
  | { type: 'renameUnit'; unitId: string; name: string }
  | { type: 'setActiveUnit'; unitId: string }
  | { type: 'addPin' }
  | { type: 'updatePin'; pinId: string; patch: Partial<Pin> }
  | { type: 'deletePins'; pinIds: string[] }
  | { type: 'bulkAddPins'; pins: Pin[] }
  | { type: 'setSelected'; pinIds: string[] }
  | { type: 'toggleSelected'; pinId: string }
  | { type: 'selectAll' }
  | { type: 'clearSelection' }
  | { type: 'bulkUpdateSelected'; patch: Partial<Pin> }
  | { type: 'bulkRenameSelected'; names: string[] }
  | { type: 'setArrangement'; side: PinSide; value: PinArrangement }
  | { type: 'setDirection'; value: PlacementDirection }
  | { type: 'setSpacing'; value: number }
  | { type: 'setLayout'; value: LayoutOptions }
  | { type: 'setVersion'; value: KicadVersion }
  | { type: 'importDoc'; name: string; units: SymbolUnit[] }
  | { type: 'reset' }

/** Replace the active unit's pin list via a mapping function. */
function mapActiveUnitPins(
  state: AppState,
  fn: (pins: Pin[]) => Pin[],
): SymbolDoc {
  return {
    ...state.doc,
    units: state.doc.units.map((u) =>
      u.id === state.activeUnitId ? { ...u, pins: fn(u.pins) } : u,
    ),
  }
}

function activeUnit(state: AppState): SymbolUnit | undefined {
  return state.doc.units.find((u) => u.id === state.activeUnitId)
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setDocField':
      return { ...state, doc: { ...state.doc, [action.key]: action.value } }

    case 'setShowPinNames':
      return { ...state, doc: { ...state.doc, showPinNames: action.value } }

    case 'setShowPinNumbers':
      return { ...state, doc: { ...state.doc, showPinNumbers: action.value } }

    case 'addUnit': {
      const unit = makeUnit(`Unit ${state.doc.units.length + 1}`)
      return {
        ...state,
        doc: { ...state.doc, units: [...state.doc.units, unit] },
        activeUnitId: unit.id,
        selectedPinIds: [],
      }
    }

    case 'removeUnit': {
      if (state.doc.units.length <= 1) return state
      const units = state.doc.units.filter((u) => u.id !== action.unitId)
      const activeUnitId =
        state.activeUnitId === action.unitId ? units[0].id : state.activeUnitId
      return {
        ...state,
        doc: { ...state.doc, units },
        activeUnitId,
        selectedPinIds: [],
      }
    }

    case 'renameUnit':
      return {
        ...state,
        doc: {
          ...state.doc,
          units: state.doc.units.map((u) =>
            u.id === action.unitId ? { ...u, name: action.name } : u,
          ),
        },
      }

    case 'setActiveUnit':
      return { ...state, activeUnitId: action.unitId, selectedPinIds: [] }

    case 'addPin': {
      const pin = makePin()
      return { ...state, doc: mapActiveUnitPins(state, (pins) => [...pins, pin]) }
    }

    case 'updatePin':
      return {
        ...state,
        doc: mapActiveUnitPins(state, (pins) =>
          pins.map((p) =>
            p.id === action.pinId ? { ...p, ...action.patch } : p,
          ),
        ),
      }

    case 'deletePins': {
      const ids = new Set(action.pinIds)
      return {
        ...state,
        doc: mapActiveUnitPins(state, (pins) => pins.filter((p) => !ids.has(p.id))),
        selectedPinIds: state.selectedPinIds.filter((id) => !ids.has(id)),
      }
    }

    case 'bulkAddPins':
      return {
        ...state,
        doc: mapActiveUnitPins(state, (pins) => [...pins, ...action.pins]),
      }

    case 'setSelected':
      return { ...state, selectedPinIds: action.pinIds }

    case 'toggleSelected': {
      const set = new Set(state.selectedPinIds)
      if (set.has(action.pinId)) set.delete(action.pinId)
      else set.add(action.pinId)
      return { ...state, selectedPinIds: [...set] }
    }

    case 'selectAll': {
      const unit = activeUnit(state)
      return { ...state, selectedPinIds: unit ? unit.pins.map((p) => p.id) : [] }
    }

    case 'clearSelection':
      return { ...state, selectedPinIds: [] }

    case 'bulkUpdateSelected': {
      const ids = new Set(state.selectedPinIds)
      return {
        ...state,
        doc: mapActiveUnitPins(state, (pins) =>
          pins.map((p) => (ids.has(p.id) ? { ...p, ...action.patch } : p)),
        ),
      }
    }

    case 'bulkRenameSelected': {
      const ids = state.selectedPinIds
      const nameById = new Map<string, string>()
      ids.forEach((id, i) => {
        if (i < action.names.length) nameById.set(id, action.names[i])
      })
      return {
        ...state,
        doc: mapActiveUnitPins(state, (pins) =>
          pins.map((p) =>
            nameById.has(p.id) ? { ...p, name: nameById.get(p.id)! } : p,
          ),
        ),
      }
    }

    case 'setArrangement':
      return {
        ...state,
        layout: {
          ...state.layout,
          arrangements: {
            ...state.layout.arrangements,
            [action.side]: action.value,
          },
        },
      }

    case 'setDirection':
      return { ...state, layout: { ...state.layout, direction: action.value } }

    case 'setSpacing':
      return { ...state, layout: { ...state.layout, spacing: action.value } }

    case 'setLayout':
      return { ...state, layout: action.value }

    case 'setVersion':
      return { ...state, version: action.value }

    case 'importDoc': {
      const units = action.units.length > 0 ? action.units : [makeUnit('Unit 1')]
      return {
        ...state,
        doc: { ...state.doc, name: action.name, value: action.name, units },
        activeUnitId: units[0].id,
        selectedPinIds: [],
      }
    }

    case 'reset':
      return createDefaultState()
  }
}
