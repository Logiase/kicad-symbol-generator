import { useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import { useStore } from '../../state/store'
import { layoutUnit } from '../../core/layout'
import { DEFAULT_SVG_OPTIONS, renderUnitSvg } from '../../core/svg'
import { Button, Select } from '../ui'
import { downloadText } from '../download'

export function SvgPreview() {
  const { t } = useI18n()
  const { state } = useStore()
  const { doc, layout } = state

  const [unitIndex, setUnitIndex] = useState(0)
  const safeIndex = Math.min(unitIndex, doc.units.length - 1)
  const unit = doc.units[safeIndex]

  const rendered = useMemo(() => {
    if (!unit) return null
    const lay = layoutUnit(unit, layout)
    const options = {
      ...DEFAULT_SVG_OPTIONS,
      fontSize: layout.nameFontSize,
      showNames: doc.showPinNames,
      showNumbers: doc.showPinNumbers,
    }

    return {
      preview: renderUnitSvg(lay, {
        ...options,
        showGrid: true,
      }),
      download: renderUnitSvg(lay, options),
    }
  }, [unit, layout, doc.showPinNames, doc.showPinNumbers])

  return (
    <div className="svg-preview">
      <div className="row between preview-toolbar">
        {doc.units.length > 1 ? (
          <Select
            value={String(safeIndex)}
            options={doc.units.map((u, i) => ({
              value: String(i),
              label: u.name || `${t('preview.unit')} ${i + 1}`,
            }))}
            onValue={(v) => setUnitIndex(Number(v))}
          />
        ) : (
          <span className="muted">{unit?.name}</span>
        )}
        <Button
          variant="ghost"
          disabled={!rendered}
          onClick={() =>
            rendered &&
            downloadText(
              `${doc.name || 'symbol'}_unit${safeIndex + 1}.svg`,
              rendered.download.svg,
              'image/svg+xml',
            )
          }
        >
          {t('preview.downloadSvg')}
        </Button>
      </div>
      <div className="svg-canvas">
        {rendered && (
          <div
            className="svg-holder"
            dangerouslySetInnerHTML={{ __html: rendered.preview.svg }}
          />
        )}
      </div>
    </div>
  )
}
