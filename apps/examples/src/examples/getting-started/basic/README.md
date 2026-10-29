---
title: SvelteDraw component
component: ./BasicExample.svelte
priority: 0
keywords:
  [
    basic,
    getting started,
    intro,
    simple,
    quick start,
    hello world,
    installation,
    first app,
    svelte-draw component,
  ]
---

The simplest way to use the `SvelteDraw` component.

---

The `SvelteDraw` component renders the full svelte-draw editor as a regular React component. Put it anywhere in your React tree; it fills whatever container it's given, so the container needs a size. Here `.svelte-draw__editor` makes it fill the page.

Import `svelte-draw/svelte-draw.css` alongside the component. Without it, the editor's UI has no styling.

By default the editor does not persist between refreshes or sync between tabs. To keep your work after a refresh, see the persistence key example.
