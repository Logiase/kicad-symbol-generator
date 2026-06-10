import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../state/store'
import { expandPattern } from '../core/expand'
import type { PinElectricalType, PinGraphicStyle, PinSide } from '../core/types'
import { sideOptions, styleOptions, typeOptions } from './options'
import { Button, Field, Panel, Select, TextInput } from './ui'

export function BulkEditPanel() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const count = state.selectedPinIds.length

  const [renamePattern, setRenamePattern] = useState('')

  const renamePreview = useMemo(() => {
    if (renamePattern.trim() === '') return null
    const r = expandPattern(renamePattern)
    return r.ok ? r.values : null
  }, [renamePattern])

  return (
    <Panel title={t('bulk.title')} right={<span className="muted">{t('pins.selectedCount', { n: count })}</span>}>
      {count === 0 ? (
        <p className="muted">{t('bulk.none')}</p>
      ) : (
        <>
          <div className="grid-2">
            <Field label={t('bulk.setSide')}>
              <Select
                value=""
                options={[{ value: '', label: '—' }, ...sideOptions(t)]}
                onValue={(v) =>
                  v &&
                  dispatch({
                    type: 'bulkUpdateSelected',
                    patch: { side: v as PinSide },
                  })
                }
              />
            </Field>
            <Field label={t('bulk.setType')}>
              <Select
                value=""
                options={[{ value: '', label: '—' }, ...typeOptions(t)]}
                onValue={(v) =>
                  v &&
                  dispatch({
                    type: 'bulkUpdateSelected',
                    patch: { electricalType: v as PinElectricalType },
                  })
                }
              />
            </Field>
            <Field label={t('bulk.setStyle')}>
              <Select
                value=""
                options={[{ value: '', label: '—' }, ...styleOptions(t)]}
                onValue={(v) =>
                  v &&
                  dispatch({
                    type: 'bulkUpdateSelected',
                    patch: { graphicStyle: v as PinGraphicStyle },
                  })
                }
              />
            </Field>
          </div>

          <div className="row gap-sm">
            <Button
              variant="ghost"
              onClick={() =>
                dispatch({ type: 'bulkUpdateSelected', patch: { hidden: false } })
              }
            >
              {t('bulk.show')}
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                dispatch({ type: 'bulkUpdateSelected', patch: { hidden: true } })
              }
            >
              {t('bulk.hide')}
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                dispatch({ type: 'deletePins', pinIds: state.selectedPinIds })
              }
            >
              {t('bulk.delete')}
            </Button>
          </div>

          <div className="rename-row">
            <span className="field-label">{t('bulk.renameTitle')}</span>
            <div className="row gap-sm">
              <TextInput
                value={renamePattern}
                placeholder={t('bulk.renamePlaceholder')}
                onChange={(e) => setRenamePattern(e.target.value)}
              />
              <Button
                variant="primary"
                disabled={!renamePreview}
                onClick={() => {
                  if (renamePreview) {
                    dispatch({
                      type: 'bulkRenameSelected',
                      names: renamePreview,
                    })
                    setRenamePattern('')
                  }
                }}
              >
                {t('bulk.rename')}
              </Button>
            </div>
            {renamePreview && (
              <span className="muted">
                {t('bulkAdd.previewCount', { n: renamePreview.length })}
              </span>
            )}
          </div>
        </>
      )}
    </Panel>
  )
}
