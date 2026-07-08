---
slug: comp-table
title: Table
nav: Table
category: components
order: 20
description: A clean, token-themed table with optional horizontal scrolling.
---

A table is the quickest way to show structured data in rows and columns:
invoices, users, plans, statuses, and anything else that is easier to scan in a
grid than in cards. `s-table` keeps the chrome subtle by using existing theme
tokens, so it stays readable in both light and dark themes.

```summit
<div class="s-table-wrap" style="max-width:560px">
  <table class="s-table">
    <thead>
      <tr>
        <th>Plan</th>
        <th>Seats</th>
        <th>Storage</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Free</td>
        <td>1</td>
        <td>5 GB</td>
        <td>Active</td>
      </tr>
      <tr>
        <td>Pro</td>
        <td>5</td>
        <td>100 GB</td>
        <td>Trial</td>
      </tr>
      <tr>
        <td>Enterprise</td>
        <td>Unlimited</td>
        <td>Custom</td>
        <td>Contact sales</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Anatomy

- `.s-table` styles the `<table>` itself: border, row dividers, header treatment,
  and zebra striping.
- `.s-table-wrap` is optional but recommended. It adds `overflow-x: auto` so
  wide tables scroll instead of breaking the layout.
- Use semantic table markup (`<thead>`, `<tbody>`, `<th>`, `<td>`) so screen
  readers and keyboard navigation behave as expected.

## Copy

```html
<div class="s-table-wrap">
  <table class="s-table">
    <thead>
      <tr>
        <th>Plan</th>
        <th>Seats</th>
        <th>Storage</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Free</td>
        <td>1</td>
        <td>5 GB</td>
        <td>Active</td>
      </tr>
      <tr>
        <td>Pro</td>
        <td>5</td>
        <td>100 GB</td>
        <td>Trial</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Notes

- Keep column headers short and explicit. If a header needs more context, add a
  visually hidden helper text pattern in your app.
- Zebra rows help scanning, but dense datasets still benefit from sorting,
  filtering, and pagination controls around the table.
- Pair tables with [badge](../comp-badge/) labels for status and
  [buttons](../comp-button/) for row actions.

See the full component set on the [overview](../components/).
