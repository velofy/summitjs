# Table

> A styled table for displaying rows of tabular data.

A table is a bordered grid of rows and columns for displaying structured data. Reach for it whenever content is naturally tabular: a list of users, a pricing comparison, a log of events. It is pure markup, so there is nothing to wire up. Wrap it in `.s-table-wrap` when columns might overflow on narrow screens.

```summit
<div class="s-table-wrap">
  <table class="s-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ada Lovelace</td>
        <td>Engineer</td>
        <td>Active</td>
      </tr>
      <tr>
        <td>Grace Hopper</td>
        <td>Admiral</td>
        <td>Active</td>
      </tr>
      <tr>
        <td>Alan Turing</td>
        <td>Mathematician</td>
        <td>Inactive</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Anatomy

A table is a standard `<table>` element carrying the `.s-table` class, optionally wrapped in `.s-table-wrap` for horizontal scrolling.

- `.s-table-wrap` sets `overflow-x: auto` so wide tables scroll instead of breaking the page layout.
- `.s-table thead th` gets a muted background and uppercase header text to separate it from the body.
- `.s-table tbody tr:nth-child(even)` gets a subtle zebra-striped background for row scanning.
- `.s-table tbody tr:hover` highlights the row under the cursor.

## Copy

```html
<div class="s-table-wrap">
  <table class="s-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ada Lovelace</td>
        <td>Engineer</td>
        <td>Active</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Notes

- Always wrap `.s-table` in `.s-table-wrap` if the table might be wider than its container, especially on mobile.
- The table takes the width of its parent. Constrain it with a `max-width` on the wrapper if needed.
- All styling comes from tokens (`--border`, `--surface-2`, `--muted`, `--accent-soft`), so it adapts automatically to light and dark themes.

See the full set in the [overview](../components/).
