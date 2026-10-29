---
title: UI primitives
component: ./UiPrimitivesExample.svelte
priority: 1
keywords: [button, dropdown, select, input, slider, popover, icon, tooltip, menu, ui]
---

Tour the UI primitives svelte-draw exports for building panels, menus, and dialogs that match its look.

---

Everything in svelte-draw's default UI is built from a small set of exported primitives, and you can use the same ones in your own components. This example renders them all in an `OnTheCanvas` panel so you can zoom in and inspect them:

- `SvelteDrawUiButton` with `SvelteDrawUiButtonLabel` and `SvelteDrawUiButtonIcon`, in its normal, primary, danger, icon, and menu types
- `SvelteDrawUiDropdownMenu*` for menus with groups, checkbox items, and submenus
- `SvelteDrawUiSelect*` for a select control, with and without item icons
- `SvelteDrawUiInput` and `SvelteDrawUiSlider`
- `SvelteDrawUiPopover*` for floating content
- `SvelteDrawUiIcon` for every icon in `iconTypes`
- `SvelteDrawUiTooltip` and `SvelteDrawUiKbd`

The primitives read svelte-draw's UI context and CSS variables, so they must be rendered inside `<SvelteDraw />` (in a `components` slot or as children) and they follow the editor's light or dark mode automatically.
