---
title: Replace a built-in overlay
component: ./ReplaceBrushOverlayExample.svelte
priority: 3
keywords: [overlay, overlayutil, brush, selection, custom, render]
---

Replace the built-in selection brush by subclassing `BrushOverlayUtil` and overriding its `render` method.

---

Every canvas overlay (the selection brush, scribble, snap indicators, shape handles) is an `OverlayUtil` subclass you can replace. This example extends the built-in `BrushOverlayUtil` and overrides `render` to draw a dashed purple rectangle instead of the default. Because the subclass inherits the `brush` type, passing it in `overlayUtils` replaces the default brush; `<SvelteDraw>` merges custom utils over the defaults by type.

Drag-select on the canvas to see it.
