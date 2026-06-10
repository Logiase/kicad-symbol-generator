import { useI18n } from '../i18n'
import { useStore } from '../state/store'
import { PIN_SIDES, type PinArrangement, type PinSide } from '../core/types'
import type { PlacementDirection } from '../core/layout'
import { arrangementOptions, directionOptions } from './options'
import { Field, NumberInput, Panel, Select } from './ui'

export function LayoutPanel() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const { layout } = state

  return (
    <Panel title={t('layout.title')}>
      <div className="grid-2">
        <Field label={t('layout.direction')}>
          <Select
            value={layout.direction}
            options={directionOptions(t)}
            onValue={(v) =>
              dispatch({ type: 'setDirection', value: v as PlacementDirection })
            }
          />
        </Field>
        <Field label={t('layout.spacing')}>
          <NumberInput
            value={layout.spacing}
            step={50}
            min={50}
            onValue={(n) => dispatch({ type: 'setSpacing', value: n || 100 })}
          />
        </Field>
      </div>
      <span className="field-label">{t('layout.arrangement')}</span>
      <div className="grid-2">
        {PIN_SIDES.map((side: PinSide) => (
          <Field key={side} label={t(`side.${side}`)}>
            <Select
              value={layout.arrangements[side]}
              options={arrangementOptions(t)}
              onValue={(v) =>
                dispatch({
                  type: 'setArrangement',
                  side,
                  value: v as PinArrangement,
                })
              }
            />
          </Field>
        ))}
      </div>
    </Panel>
  )
}
