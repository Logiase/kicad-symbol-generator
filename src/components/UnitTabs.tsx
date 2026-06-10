import { useI18n } from '../i18n'
import { useStore } from '../state/store'
import { Button } from './ui'

export function UnitTabs() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const { doc, activeUnitId } = state

  return (
    <div className="unit-tabs">
      <div className="tabs">
        {doc.units.map((unit, i) => (
          <button
            key={unit.id}
            className={`tab ${unit.id === activeUnitId ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'setActiveUnit', unitId: unit.id })}
            onDoubleClick={() => {
              const name = prompt(t('units.rename'), unit.name)
              if (name !== null) {
                dispatch({ type: 'renameUnit', unitId: unit.id, name })
              }
            }}
            title={unit.name}
          >
            {unit.name || t('units.unit', { n: i + 1 })}
            <span className="tab-count">{unit.pins.length}</span>
          </button>
        ))}
      </div>
      <div className="row gap-sm">
        <Button variant="ghost" onClick={() => dispatch({ type: 'addUnit' })}>
          + {t('units.add')}
        </Button>
        <Button
          variant="ghost"
          disabled={doc.units.length <= 1}
          onClick={() => {
            if (confirm(t('units.confirmRemove'))) {
              dispatch({ type: 'removeUnit', unitId: activeUnitId })
            }
          }}
        >
          {t('units.remove')}
        </Button>
      </div>
    </div>
  )
}
