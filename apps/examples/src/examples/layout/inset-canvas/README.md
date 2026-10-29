---
title: Inset canvas
component: ./InsetCanvasExample.svelte
priority: 1
keywords: [canvas position, inset, css, custom layout, canvas offset]
---

Move the `.tl-canvas` element so it no longer fills the `SvelteDraw` container.

---

Normally the canvas fills the whole `SvelteDraw` container and the UI floats over it. This example uses CSS to shrink and center the `.tl-canvas` element to the middle 50% of the container, leaving the UI where it was. Pointer positions, hit testing, and the camera still line up correctly because the editor measures the canvas element itself, not its container.

This is an unusual layout; the point of the example is to show that if you need to reposition the canvas within the editor's chrome, you can do it with CSS alone.
