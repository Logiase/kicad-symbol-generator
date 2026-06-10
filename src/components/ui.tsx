import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

/** A titled panel/section. */
export function Panel({
  title,
  right,
  children,
}: {
  title: string
  right?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {right}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className="input" {...props} />
}

export function NumberInput({
  value,
  onValue,
  ...rest
}: { value: number; onValue: (n: number) => void } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
>) {
  return (
    <input
      type="number"
      className="input"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onValue(Number(e.target.value))
      }
      {...rest}
    />
  )
}

export interface Option {
  value: string
  label: string
}

export function Select({
  value,
  options,
  onValue,
  ...rest
}: {
  value: string
  options: Option[]
  onValue: (v: string) => void
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>) {
  return (
    <select
      className="select"
      value={value}
      onChange={(e) => onValue(e.target.value)}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Button({
  children,
  variant = 'default',
  ...rest
}: {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`btn btn-${variant}`} {...rest}>
      {children}
    </button>
  )
}

export function Checkbox({
  checked,
  onValue,
  label,
}: {
  checked: boolean
  onValue: (v: boolean) => void
  label?: string
}) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onValue(e.target.checked)}
      />
      {label && <span>{label}</span>}
    </label>
  )
}
