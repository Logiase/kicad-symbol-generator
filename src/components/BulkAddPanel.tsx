import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../state/store'
import { expandPattern } from '../core/expand'
import type { Pin, PinElectricalType, PinGraphicStyle, PinSide } from '../core/types'
import { makePin } from '../state/defaults'
import { sideOptions, styleOptions, typeOptions } from './options'
import { Button, Field, Panel, Select, TextInput } from './ui'

export function BulkAddPanel() {
  const { t } = useI18n()
  const { dispatch } = useStore()

  const [namePattern, setNamePattern] = useState('')
  const [numberPattern, setNumberPattern] = useState('')
  const [side, setSide] = useState<PinSide>('left')
  const [type, setType] = useState<PinElectricalType>('input')
  const [style, setStyle] = useState<PinGraphicStyle>('line')

  const result = useMemo(
    () => buildPins(namePattern, numberPattern, side, type, style),
    [namePattern, numberPattern, side, type, style],
  )

  return (
    <Panel title={t('bulkAdd.title')}>
      <div className="grid-2">
        <Field label={t('bulkAdd.namePattern')}>
          <TextInput
            value={namePattern}
            placeholder={t('bulkAdd.namePlaceholder')}
            onChange={(e) => setNamePattern(e.target.value)}
          />
        </Field>
        <Field label={t('bulkAdd.numberPattern')}>
          <TextInput
            value={numberPattern}
            placeholder={t('bulkAdd.numberPlaceholder')}
            onChange={(e) => setNumberPattern(e.target.value)}
          />
        </Field>
        <Field label={t('bulkAdd.side')}>
          <Select
            value={side}
            options={sideOptions(t)}
            onValue={(v) => setSide(v as PinSide)}
          />
        </Field>
        <Field label={t('bulkAdd.type')}>
          <Select
            value={type}
            options={typeOptions(t)}
            onValue={(v) => setType(v as PinElectricalType)}
          />
        </Field>
        <Field label={t('bulkAdd.style')}>
          <Select
            value={style}
            options={styleOptions(t)}
            onValue={(v) => setStyle(v as PinGraphicStyle)}
          />
        </Field>
      </div>

      <div className="bulk-preview">
        <div className="row between">
          <span className="field-label">{t('bulkAdd.preview')}</span>
          {result.error ? (
            <span className="error">{t(result.error)}</span>
          ) : (
            <span className="muted">
              {t('bulkAdd.previewCount', { n: result.pins.length })}
            </span>
          )}
        </div>
        <div className="preview-chips">
          {result.pins.slice(0, 40).map((p, i) => (
            <span key={i} className="chip">
              {p.name}
              {p.number ? ` (${p.number})` : ''}
            </span>
          ))}
          {result.pins.length > 40 && <span className="chip">…</span>}
        </div>
      </div>

      <Button
        variant="primary"
        disabled={result.pins.length === 0 || !!result.error}
        onClick={() => {
          dispatch({ type: 'bulkAddPins', pins: result.pins })
          setNamePattern('')
          setNumberPattern('')
        }}
      >
        + {t('bulkAdd.add')}
      </Button>
    </Panel>
  )
}

interface BuildResult {
  pins: Pin[]
  error?: 'expand.error.rangeLengthMismatch' | 'expand.error.empty'
}

function buildPins(
  namePattern: string,
  numberPattern: string,
  side: PinSide,
  type: PinElectricalType,
  style: PinGraphicStyle,
): BuildResult {
  if (namePattern.trim() === '') return { pins: [] }

  const names = expandPattern(namePattern)
  if (!names.ok) return { pins: [], error: names.errorKey }

  let numbers: string[] = []
  if (numberPattern.trim() !== '') {
    const num = expandPattern(numberPattern)
    if (!num.ok) return { pins: [], error: num.errorKey }
    numbers = num.values
    if (numbers.length !== names.values.length) {
      return { pins: [], error: 'expand.error.rangeLengthMismatch' }
    }
  }

  const pins = names.values.map((name, i) =>
    makePin({
      name,
      number: numbers[i] ?? '',
      side,
      electricalType: type,
      graphicStyle: style,
    }),
  )
  return { pins }
}
