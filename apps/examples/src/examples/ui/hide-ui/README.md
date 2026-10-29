---
title: Hide the entire UI
component: ./HideUiExample.svelte
priority: 1.5
keywords: [hideui, bare editor, minimal, custom ui, headless]
---

Hide all of svelte-draw's default UI with the `hideUi` prop.

---

Passing `hideUi` to `<SvelteDraw>` removes the toolbar, menus, and panels while keeping the canvas, default shapes, tools, and keyboard shortcuts. The editor is fully functional; you just need to provide your own controls, typically by rendering components inside `<SvelteDraw>` that call `getEditor()`.

Keyboard shortcuts still work here, so try pressing `d` for the draw tool or `r` for a rectangle. See the custom UI example for building your own controls.
