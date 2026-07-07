# Pagination

> Navigate through pages of results.

Pagination splits a long list of results into numbered pages and gives people
Prev and Next controls to move through them. One number of state, the current
page, drives which button is active and when the ends disable. The number
buttons themselves come straight out of a [s-for](../s-for/).

## A live pager

`page` holds the current page and `total` the count. Prev and Next clamp with
`Math.max` and `Math.min` so they never step past the ends, and `:disabled`
greys them out there. Each numbered button sets `page` to its own value and lights
up through `:class` when it matches.

```summit
<div s-data="{ page: 1, total: 5 }">
  <div class="s-pagination">
    <button @click="page = Math.max(1, page - 1)" :disabled="page === 1">Prev</button>
    <template s-for="n in total" :key="n">
      <button :class="{ 'is-active': page === n }" @click="page = n" s-text="n"></button>
    </template>
    <button @click="page = Math.min(total, page + 1)" :disabled="page === total">Next</button>
  </div>
</div>
```

```html
<div s-data="{ page: 1, total: 5 }">
  <div class="s-pagination">
    <button @click="page = Math.max(1, page - 1)" :disabled="page === 1">Prev</button>
    <template s-for="n in total" :key="n">
      <button :class="{ 'is-active': page === n }" @click="page = n" s-text="n"></button>
    </template>
    <button @click="page = Math.min(total, page + 1)" :disabled="page === total">Next</button>
  </div>
</div>
```

## Notes

- Prev disables at page one and Next at the last page, driven by `:disabled`. The
  stylesheet fades a disabled control and turns off its pointer events, so it
  reads as unavailable and cannot be clicked.
- `Math.max(1, page - 1)` and `Math.min(total, page + 1)` keep `page` inside
  range even if a control is clicked at the edge, so the state can never run off
  either end.
- The `is-active` class fills the current page with your accent color. Because it
  is bound with `:class`, exactly one number lights up at a time.
- `page` is a plain number, so you can watch it to fetch the matching slice of
  data, or seed it from the URL to deep-link a page.

To show where the current page sits in your site hierarchy instead, see
[Breadcrumb](../comp-breadcrumb/). The whole set is on the
[overview](../components/).
