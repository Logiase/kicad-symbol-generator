import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { reducer, type Action } from './reducer'
import { createDefaultState, type AppState } from './defaults'

const STORAGE_KEY = 'ksg.state.v1'

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (
      parsed &&
      parsed.doc &&
      Array.isArray(parsed.doc.units) &&
      parsed.doc.units.length > 0 &&
      parsed.layout &&
      parsed.version
    ) {
      const activeExists = parsed.doc.units.some(
        (u) => u.id === parsed.activeUnitId,
      )
      return {
        ...createDefaultState(),
        ...(parsed as AppState),
        activeUnitId: activeExists
          ? (parsed.activeUnitId as string)
          : parsed.doc.units[0].id,
        selectedPinIds: [],
      }
    }
  } catch {
    // Corrupt storage -> fall back to defaults.
  }
  return createDefaultState()
}

interface StoreValue {
  state: AppState
  dispatch: Dispatch<Action>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // Ignore quota / serialization errors.
      }
    }, 200)
    return () => clearTimeout(id)
  }, [state])

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
