import { useI18n } from '../i18n'
import { useStore } from '../state/store'
import { Checkbox, Field, Panel, TextInput } from './ui'

export function SymbolProperties() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const { doc } = state

  const set = (key: 'name' | 'reference' | 'value' | 'footprint' | 'datasheet' | 'description') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'setDocField', key, value: e.target.value })

  return (
    <Panel title={t('props.title')}>
      <div className="grid-2">
        <Field label={t('props.name')}>
          <TextInput value={doc.name} onChange={set('name')} />
        </Field>
        <Field label={t('props.reference')}>
          <TextInput value={doc.reference} onChange={set('reference')} />
        </Field>
        <Field label={t('props.value')}>
          <TextInput value={doc.value} onChange={set('value')} />
        </Field>
        <Field label={t('props.footprint')}>
          <TextInput value={doc.footprint} onChange={set('footprint')} />
        </Field>
        <Field label={t('props.datasheet')}>
          <TextInput value={doc.datasheet} onChange={set('datasheet')} />
        </Field>
        <Field label={t('props.description')}>
          <TextInput value={doc.description} onChange={set('description')} />
        </Field>
      </div>
      <div className="row gap">
        <Checkbox
          checked={doc.showPinNames}
          onValue={(v) => dispatch({ type: 'setShowPinNames', value: v })}
          label={t('props.showPinNames')}
        />
        <Checkbox
          checked={doc.showPinNumbers}
          onValue={(v) => dispatch({ type: 'setShowPinNumbers', value: v })}
          label={t('props.showPinNumbers')}
        />
      </div>
    </Panel>
  )
}
