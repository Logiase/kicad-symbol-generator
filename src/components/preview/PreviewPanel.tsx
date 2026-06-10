import { useState } from 'react'
import { useI18n } from '../../i18n'
import { KicadSymPreview } from './KicadSymPreview'
import { SvgPreview } from './SvgPreview'

type Tab = 'svg' | 'kicad'

export function PreviewPanel() {
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>('svg')

  return (
    <div className="preview-panel">
      <div className="tabs preview-tabs">
        <button
          className={`tab ${tab === 'svg' ? 'active' : ''}`}
          onClick={() => setTab('svg')}
        >
          {t('preview.svg')}
        </button>
        <button
          className={`tab ${tab === 'kicad' ? 'active' : ''}`}
          onClick={() => setTab('kicad')}
        >
          {t('preview.kicad')}
        </button>
      </div>
      <div className="preview-content">
        {tab === 'svg' ? <SvgPreview /> : <KicadSymPreview />}
      </div>
    </div>
  )
}
