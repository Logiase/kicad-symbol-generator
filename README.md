# KiCAD Symbol Generator

A browser-based tool for designing KiCAD schematic symbols, deployable to GitHub
Pages. Design multi-unit symbols, create pins in bulk by pattern, lay them out on
the four sides with selectable ordering, and export a ready-to-use `.kicad_sym`
file (KiCAD 10 by default; 7/8/9 also supported). Includes a live SVG preview and
a live `.kicad_sym` text preview, plus kipart-compatible CSV import/export.

English / 简体中文 UI (toggle in the header).

## Features

- **Multiple units** per symbol, each with its own pin set.
- **Pattern-based bulk pin creation**: `PIN_[0..63]`, `PORT[0..31]_IN`,
  descending ranges like `D[7..0]`, zero padding like `[00..15]`, and multiple
  lock-step ranges in one pattern.
- **CSV import/export** compatible with [kipart](https://github.com/devbisme/kipart):
  `Pin, Name, Type, Side, Unit, Style, Hidden` columns.
- **Four-side placement** (left / right / top / bottom) with per-side ordering
  (list order, by number, by name) and a global walk direction (default,
  clockwise, counter-clockwise).
- **Bulk operations**: multi-select pins, then change side / type / style /
  visibility, delete, or rename by pattern.
- **Live SVG preview** and **live `.kicad_sym` preview** with copy / download.
- **mil-based, grid-aligned** geometry; coordinates convert to mm only on export.
- Correct pin names, ordering and orientation following KiCAD conventions.
- State auto-saves to `localStorage`.

## Pattern syntax

A pattern may contain one or more `[start..end]` range tokens:

| Pattern          | Expands to                          |
| ---------------- | ----------------------------------- |
| `PIN_[0..63]`    | `PIN_0` … `PIN_63`                   |
| `PORT[0..31]_IN` | `PORT0_IN` … `PORT31_IN`            |
| `D[7..0]`        | `D7`, `D6`, … `D0` (descending)     |
| `A[00..15]`      | `A00` … `A15` (zero padded)         |
| `VCC`            | `VCC` (no range = single value)     |

When a pattern contains several ranges, they advance together and must have the
same length (e.g. `BANK[0..1]_D[0..1]` → `BANK0_D0`, `BANK1_D1`).

## CSV format

```
MyChip
Pin,Name,Type,Side,Unit,Style,Hidden
1,IN,input,left,1,line,
2,OUT,output,right,1,line,
3,VCC,power_in,top,1,line,
4,GND,power_in,bottom,1,line,
```

Import is tolerant: columns may appear in any order and are matched
case-insensitively; missing columns get sensible defaults.

## Project structure

```
src/
  core/        Pure, UI-free logic (unit-testable)
    types.ts       Domain model (SymbolDoc / SymbolUnit / Pin)
    expand.ts      Pattern expansion
    layout.ts      Geometry engine (mil, Y-up)
    svg.ts         Layout -> SVG renderer
    kicadsym.ts    .kicad_sym (S-expression) generator
    csv.ts         kipart-compatible CSV import/export
    units.ts       mil/mm conversion helpers
  i18n/        Lightweight typed i18n (en / zh)
  state/       useReducer store + localStorage persistence
  components/  React UI (editor panels + preview)
```

Core logic is intentionally separate from the UI so it can be reused and tested
in isolation.

## Local development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Deployment (GitHub Pages)

1. Push to the `main` (or `master`) branch.
2. In the repository settings, set **Pages → Build and deployment → Source** to
   **GitHub Actions**.
3. The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
   builds and publishes `dist/` automatically.

The production base path is `/kicad-symbol-generator/` (see
[vite.config.ts](vite.config.ts)). If your repository has a different name,
update `base` accordingly.
