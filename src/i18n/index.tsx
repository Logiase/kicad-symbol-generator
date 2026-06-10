import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { en, type TranslationKey } from './en'
import { zh } from './zh'

export type Lang = 'en' | 'zh'

const DICTS: Record<Lang, Record<TranslationKey, string>> = { en, zh }

const STORAGE_KEY = 'ksg.lang'

export type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  t: TranslateFn
}

const I18nContext = createContext<I18nContextValue | null>(null)

function detectInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'zh') return stored
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'zh' : 'en')
  }, [lang, setLang])

  const t = useCallback<TranslateFn>(
    (key, params) => interpolate(DICTS[lang][key] ?? key, params),
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggle, t }),
    [lang, setLang, toggle, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export type { TranslationKey }
