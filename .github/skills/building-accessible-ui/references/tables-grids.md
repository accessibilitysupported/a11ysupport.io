# Tables and grids

Static tabular data uses `<table>` with programmatic header/cell associations. Interactive tabular experiences (spreadsheets, data grids with keyboard cell navigation, calendars) may use grid semantics. Do not use tables for layout.

## Web implementation

### Static tabular data: `<table>`

- Use `<table>` for any data with row/column relationships.
- Use `<th>` (not `<td>`) for headers. Column headers live in the first `<tr>` (or inside `<thead>`); row headers use `<th>` at the start of each body row when relevant.
- Use `scope="col"` / `scope="row"` on `<th>` for non-trivial tables so AT knows the direction.
- Provide a `<caption>` naming the table when the surrounding context doesn't already name it.
- Do not nest tables for layout.

```html
<table>
  <caption>Quarterly revenue by region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North</th>
      <td>$1.2M</td>
      <td>$1.5M</td>
    </tr>
  </tbody>
</table>
```

### Interactive grids: `role="grid"`

Only for truly interactive experiences.

- Grid cells must be inside rows: `role="row"` → `role="gridcell"` (or `role="columnheader"` / `role="rowheader"`).
- One tab stop for the grid; arrow keys move between cells (roving tabindex or `aria-activedescendant`).
- Keep header relationships determinable via `role="columnheader"` / `role="rowheader"`.
- For row selection, mark the row with `aria-selected` and the grid with `aria-multiselectable` when applicable.

## Quick checks

- [ ] Data with row/column relationships uses `<table>`; tables are not used for visual layout.
- [ ] Header cells use `<th>` (not styled `<td>`); column headers are in the first row or `<thead>`.
- [ ] Non-trivial tables set `scope="col"` / `scope="row"` on each `<th>`.
- [ ] The table has a `<caption>` (or is otherwise named by surrounding context) that describes its content.
- [ ] A screen reader announces the relevant header when focus or the virtual cursor enters a cell.
- [ ] Tables are not nested for layout purposes.
- [ ] Merged cells (`colspan` / `rowspan`) are used only when the data truly spans and do not break header association.
- [ ] Interactive grids use `role="grid"` with `role="row"` and `role="gridcell"` / `role="columnheader"` / `role="rowheader"` inside.
- [ ] An interactive grid has one tab stop; arrow keys move between cells (roving tabindex or `aria-activedescendant`), and Tab exits the grid.
- [ ] Selectable rows expose state via `aria-selected`; the grid sets `aria-multiselectable` when multi-select is supported.
- [ ] Sortable columns expose sort state with `aria-sort="ascending" | "descending" | "none"` on the header.
