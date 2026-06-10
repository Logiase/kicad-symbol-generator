import { useRef } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../state/store'
import { exportCsv, importCsv } from '../core/csv'
import { Button } from './ui'
import { downloadText, readFileText } from './download'

export function CsvBar() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    const csv = exportCsv(state.doc.name, state.doc.units)
    downloadText(`${state.doc.name || 'symbol'}.csv`, csv, 'text/csv')
  }

  const onImport = async (file: File) => {
    const text = await readFileText(file)
    const result = importCsv(text)
    if ('errorKey' in result) {
      alert(t(result.errorKey))
      return
    }
    dispatch({ type: 'importDoc', name: result.name, units: result.units })
    const total = result.units.reduce((s, u) => s + u.pins.length, 0)
    alert(t('csv.imported', { n: total }))
  }

  return (
    <div className="row gap-sm">
      <Button variant="ghost" onClick={onExport}>
        ↓ {t('csv.export')}
      </Button>
      <Button variant="ghost" onClick={() => fileRef.current?.click()}>
        ↑ {t('csv.import')}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImport(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
