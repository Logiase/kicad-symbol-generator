import type { TranslateFn, TranslationKey } from '../i18n'
import {
  PIN_ARRANGEMENTS,
  PIN_ELECTRICAL_TYPES,
  PIN_GRAPHIC_STYLES,
  PIN_SIDES,
} from '../core/types'
import type { Option } from './ui'

/** Build select options for an enum, labelled via `<prefix>.<value>`. */
function toOptions(
  values: readonly string[],
  prefix: string,
  t: TranslateFn,
): Option[] {
  return values.map((value) => ({
    value,
    label: t(`${prefix}.${value}` as TranslationKey),
  }))
}

export const sideOptions = (t: TranslateFn) =>
  toOptions(PIN_SIDES, 'side', t)

export const typeOptions = (t: TranslateFn) =>
  toOptions(PIN_ELECTRICAL_TYPES, 'type', t)

export const styleOptions = (t: TranslateFn) =>
  toOptions(PIN_GRAPHIC_STYLES, 'style', t)

export const arrangementOptions = (t: TranslateFn) =>
  toOptions(PIN_ARRANGEMENTS, 'arrangement', t)

export const directionOptions = (t: TranslateFn): Option[] =>
  toOptions(['default', 'clockwise', 'counter_clockwise'], 'direction', t)
