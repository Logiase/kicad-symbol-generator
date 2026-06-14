import { useRef, type KeyboardEvent } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../state/store'
import type { Pin } from '../core/types'
import { sideOptions, styleOptions, typeOptions } from './options'
import { Button, NumberInput, Select } from './ui'

/** Editable columns that support Enter-to-next-row navigation, in order. */
type CellCol = 'number' | 'name' | 'type' | 'side' | 'style' | 'length'

export function PinTable() {
  const { t } = useI18n()
  const { state, dispatch } = useStore()
  const unit = state.doc.units.find((u) => u.id === state.activeUnitId)
  const pins = unit?.pins ?? []
  const selected = new Set(state.selectedPinIds)
  const tableRef = useRef<HTMLTableElement>(null)

  const types = typeOptions(t)
  const styles = styleOptions(t)
  const sides = sideOptions(t)

  const allSelected = pins.length > 0 && selected.size === pins.length

  const update = (pinId: string, patch: Partial<Pin>) =>
    dispatch({ type: 'updatePin', pinId, patch })

  const focusCell = (row: number, col: CellCol) => {
    const el = tableRef.current?.querySelector<HTMLElement>(
      `[data-cell="${row}:${col}"]`,
    )
    if (!el) return
    el.focus()
    if (el instanceof HTMLInputElement && el.type === 'text') el.select()
  }

  /** On Enter, move focus to the same column in the next row. */
  const onCellKeyDown = (
    e: KeyboardEvent<HTMLElement>,
    row: number,
    col: CellCol,
  ) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    focusCell(row + 1, col)
  }

  const cellProps = (row: number, col: CellCol) => ({
    'data-cell': `${row}:${col}`,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => onCellKeyDown(e, row, col),
  })

  return (
    <div className="pin-table-wrap">
      <table className="pin-table" ref={tableRef}>
        <thead>
          <tr>
            <th className="col-sel">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) =>
                  dispatch(
                    e.target.checked
                      ? { type: 'selectAll' }
                      : { type: 'clearSelection' },
                  )
                }
              />
            </th>
            <th>{t('pins.col.number')}</th>
            <th>{t('pins.col.name')}</th>
            <th>{t('pins.col.type')}</th>
            <th>{t('pins.col.side')}</th>
            <th>{t('pins.col.style')}</th>
            <th>{t('pins.col.hidden')}</th>
            <th className="col-len">{t('pins.col.length')}</th>
            <th className="col-act" />
          </tr>
        </thead>
        <tbody>
          {pins.map((pin, row) => (
            <tr key={pin.id} className={selected.has(pin.id) ? 'selected' : ''}>
              <td className="col-sel">
                <input
                  type="checkbox"
                  checked={selected.has(pin.id)}
                  onChange={() =>
                    dispatch({ type: 'toggleSelected', pinId: pin.id })
                  }
                />
              </td>
              <td>
                <input
                  className="input cell"
                  value={pin.number}
                  onChange={(e) => update(pin.id, { number: e.target.value })}
                  {...cellProps(row, 'number')}
                />
              </td>
              <td>
                <input
                  className="input cell"
                  value={pin.name}
                  onChange={(e) => update(pin.id, { name: e.target.value })}
                  {...cellProps(row, 'name')}
                />
              </td>
              <td>
                <Select
                  value={pin.electricalType}
                  options={types}
                  onValue={(v) =>
                    update(pin.id, { electricalType: v as Pin['electricalType'] })
                  }
                  {...cellProps(row, 'type')}
                />
              </td>
              <td>
                <Select
                  value={pin.side}
                  options={sides}
                  onValue={(v) => update(pin.id, { side: v as Pin['side'] })}
                  {...cellProps(row, 'side')}
                />
              </td>
              <td>
                <Select
                  value={pin.graphicStyle}
                  options={styles}
                  onValue={(v) =>
                    update(pin.id, { graphicStyle: v as Pin['graphicStyle'] })
                  }
                  {...cellProps(row, 'style')}
                />
              </td>
              <td className="col-sel">
                <input
                  type="checkbox"
                  checked={pin.hidden}
                  onChange={(e) => update(pin.id, { hidden: e.target.checked })}
                />
              </td>
              <td className="col-len">
                <NumberInput
                  value={pin.length}
                  onValue={(n) => update(pin.id, { length: n })}
                  step={50}
                  min={0}
                  {...cellProps(row, 'length')}
                />
              </td>
              <td className="col-act">
                <Button
                  variant="ghost"
                  onClick={() =>
                    dispatch({ type: 'deletePins', pinIds: [pin.id] })
                  }
                  title={t('pins.delete')}
                >
                  ✕
                </Button>
              </td>
            </tr>
          ))}
          {pins.length === 0 && (
            <tr>
              <td colSpan={9} className="empty">
                {t('pins.empty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="row gap-sm pin-table-foot">
        <Button variant="primary" onClick={() => dispatch({ type: 'addPin' })}>
          + {t('pins.add')}
        </Button>
        <span className="muted">{t('pins.selectedCount', { n: selected.size })}</span>
      </div>
    </div>
  )
}
