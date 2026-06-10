import { useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import { useStore } from '../../state/store'
import {
  KICAD_VERSIONS,
  generateKicadSym,
  type KicadVersion,
} from '../../core/kicadsym'
import { Button, Field, Select } from '../ui'
import { downloadText } from '../download'

export function KicadSymPreview() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const { doc, layout, version } = state
  const [copied, setCopied] = useState(false)

  const text = useMemo(
    () => generateKicadSym(doc, { version, layout }),
    [doc, version, layout],
  )

  const versionOptions = (Object.keys(KICAD_VERSIONS) as KicadVersion[]).map(
    (v) => ({ value: v, label: `KiCAD ${v}` }),
  )

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable; ignore.
    }
  }

  return (
    <div className="kicad-preview">
      <div className="row between preview-toolbar">
        <Field label={t('preview.version')}>
          <Select
            value={version}
            options={versionOptions}
            onValue={(v) =>
              dispatch({ type: 'setVersion', value: v as KicadVersion })
            }
          />
        </Field>
        <div className="row gap-sm">
          <Button variant="ghost" onClick={onCopy}>
            {copied ? t('preview.copied') : t('preview.copy')}
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              downloadText(
                `${doc.name || 'symbol'}.kicad_sym`,
                text,
                'text/plain',
              )
            }
          >
            {t('preview.download')}
          </Button>
        </div>
      </div>
      <pre className="code-block">{text}</pre>
    </div>
  )
}
