import './App.css'
import { useI18n } from './i18n'
import { useStore } from './state/store'
import { SymbolProperties } from './components/SymbolProperties'
import { UnitTabs } from './components/UnitTabs'
import { PinTable } from './components/PinTable'
import { BulkAddPanel } from './components/BulkAddPanel'
import { BulkEditPanel } from './components/BulkEditPanel'
import { LayoutPanel } from './components/LayoutPanel'
import { CsvBar } from './components/CsvBar'
import { PreviewPanel } from './components/preview/PreviewPanel'
import { Button, Panel } from './components/ui'

function App() {
  const { t, toggle } = useI18n()
  const { dispatch } = useStore()

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>{t('app.title')}</h1>
          <p className="subtitle">{t('app.subtitle')}</p>
        </div>
        <div className="row gap-sm">
          <CsvBar />
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm(t('common.confirmReset'))) dispatch({ type: 'reset' })
            }}
          >
            {t('common.reset')}
          </Button>
          <Button variant="ghost" onClick={toggle}>
            {t('lang.toggle')}
          </Button>
          <a
            className="btn btn-ghost"
            href="https://github.com/Logiase/kicad-symbol-generator"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="app-main">
        <div className="editor-col">
          <SymbolProperties />
          <Panel title={t('pins.title')}>
            <UnitTabs />
            <PinTable />
          </Panel>
          <BulkAddPanel />
          <BulkEditPanel />
          <LayoutPanel />
        </div>
        <div className="preview-col">
          <PreviewPanel />
        </div>
      </main>
    </div>
  )
}

export default App
