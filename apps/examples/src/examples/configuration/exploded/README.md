---
title: Sublibraries
component: ./ExplodedExample.svelte
priority: 100
keywords:
  [
    svelte-draweditor,
    svelte-drawui,
    sublibraries,
    modular,
    architecture,
    defaultshapeutils,
    defaulttools,
    components,
  ]
---

Assemble the `SvelteDraw` component yourself from `SvelteDrawEditor`, `SvelteDrawUi`, and the default shapes and tools.

---

The `SvelteDraw` component is a convenience wrapper. Underneath it is `SvelteDrawEditor` (the canvas and editor, with no shapes, tools, or UI of its own), `SvelteDrawUi` (the default menus, toolbar, and panels), and a set of defaults: `defaultShapeUtils`, `defaultBindingUtils`, `defaultTools`, `defaultShapeTools`, and so on.

This example builds the same editor from those pieces. It behaves like the plain `SvelteDraw` component, but every part is now visible and replaceable: drop a shape util from the list, pass a different tool set, or leave out `SvelteDrawUi` and supply your own interface. The only-editor example goes further and uses `SvelteDrawEditor` with a single custom shape and tool.
