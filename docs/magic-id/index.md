# $id

> Generate stable, scoped unique ids.

`$id` generates a stable, unique id, which is exactly what you need to pair a
label with its input or to wire up `aria-` attributes without hand-writing ids
that might collide. The signature is `$id(name, key?)`.

```summit
<div s-data="{}" s-id="['email']">
  <label :for="$id('email')">Email</label>
  <input :id="$id('email')" type="email" />
</div>
```

Both calls to `$id('email')` return the same value, so the label's `for` matches
the input's `id`. The generated id is unique on the page, so you can render this
component many times and every copy stays correctly paired.

## Scoping ids with s-id

By default each `$id` call produces a fresh page-unique id, which means two
separate calls would not agree. The `s-id` directive fixes that: it opens an id
group on an element, and every `$id('name')` inside that subtree returns the same
id for that name.

```html
<div s-id="['email', 'password']">
  ...every $id('email') and $id('password') in here is stable...
</div>
```

Pass `s-id` an array of the names you want to scope. Groups nest: an inner
`s-id` shadows an outer one for the names it lists.

## Ids in a list

Inside an [s-for](../s-for/) loop, open a fresh group per row so each row gets
its own ids and none of them collide.

```html
<template s-for="user in users" :key="user.id">
  <div s-id="['row']">
    <label :for="$id('row')" s-text="user.name"></label>
    <input :id="$id('row')" :aria-describedby="$id('row') + '-hint'" />
  </div>
</template>
```

## The key argument

The optional second argument appends a key to the id, which is handy when one
group needs a distinct id per item without a wrapper element.

```html
<div s-id="['opt']">
  <template s-for="choice in choices" :key="choice">
    <label :for="$id('opt', choice)" s-text="choice"></label>
    <input type="radio" :id="$id('opt', choice)" name="choice" :value="choice" />
  </template>
</div>
```

Every `$id('opt', choice)` for a given `choice` returns the same id, so labels
and radios line up per option.
