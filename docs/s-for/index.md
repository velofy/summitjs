# s-for

> Render a list, reconciled by key.

`s-for` renders one copy of a template for each item in a collection. It lives on
a `<template>` element and, with a `:key`, reconciles the list by key so existing
nodes are moved rather than rebuilt.

## Rendering a list

Put `s-for` on a `<template>` that wraps a single root element. Summit renders
that element once per item and inserts the results where the template stood.

```summit
<div s-data="{ colors: ['teal', 'amber', 'rose'] }">
  <ul>
    <template s-for="color in colors">
      <li s-text="color"></li>
    </template>
  </ul>
</div>
```

The template must be a `<template>` tag with exactly one root child. Summit warns
in the console if either is missing.

## Item and index

Use `item in items` for just the value, or `(item, index) in items` when you also
need the position.

```summit
<div s-data="{ tasks: ['Write docs', 'Ship it', 'Celebrate'] }">
  <ol>
    <template s-for="(task, i) in tasks">
      <li><span s-text="i + 1"></span>. <span s-text="task"></span></li>
    </template>
  </ol>
</div>
```

Each iteration gets its own scope holding `item` (and `index` if named). Those
blocks can still read state from ancestor components as usual. Both `in` and `of`
are accepted as the separator.

## Iterating a range

Give `s-for` a number and it counts from 1 up to that number.

```summit
<div s-data="{ n: 5 }">
  <div>
    <template s-for="star in n">
      <span s-text="'*'"></span>
    </template>
  </div>
</div>
```

`star in 5` yields the values `1, 2, 3, 4, 5`.

## Iterating an object

Pass an object and `(value, key) in object` gives you each entry. The second name
receives the property key.

```summit
<div s-data="{ specs: { cpu: '8 core', ram: '16 GB', ssd: '1 TB' } }">
  <dl>
    <template s-for="(value, key) in specs">
      <div><dt s-text="key"></dt><dd s-text="value"></dd></div>
    </template>
  </dl>
</div>
```

## Keyed reconciliation

Add `:key` (or `s-bind:key`) with an expression that is unique per item. When the
list changes, Summit matches items by key: a block whose key already exists is
kept and moved to its new position rather than destroyed and recreated. That
preserves DOM state such as focus, scroll, and uncommitted input values across
reorders.

```summit
<div s-data="{
  people: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }, { id: 3, name: 'Alan' }],
  reverse() { this.people = [...this.people].reverse() }
}">
  <button @click="reverse()">Reverse order</button>
  <ul>
    <template s-for="person in people" :key="person.id">
      <li>
        <span s-text="person.name"></span>
        <input placeholder="type here, then reverse" />
      </li>
    </template>
  </ul>
</div>
```

Type into an input, then reverse the list: because each row is matched by
`person.id` and moved, your text stays with its person. Without a `:key`, Summit
falls back to the object key for objects, or the numeric index otherwise, which
rebuilds rows when their position changes and loses that state.

To conditionally render a single element rather than a list, see
[s-if](../s-if/).
