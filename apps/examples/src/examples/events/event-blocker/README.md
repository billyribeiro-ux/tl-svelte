---
title: Block events
component: ./EventBlockerExample.svelte
priority: 2
keywords: [event, block, pointer-events, overlay, infrontofthecanvas, user-select]
---

Overlay UI on the canvas that captures pointer events instead of passing them through.

---

The `InFrontOfTheCanvas` component slot renders a full-size layer over the canvas with
`pointer-events: none`, so anything you put there is click-through by default. To make part of it
interactive, set `pointer-events: all` on that element. The slot sits above the canvas and marks
pointer events that start inside it as handled, so svelte-draw won't select, draw, or pan in response.

Try clicking and dragging inside the box, then outside it. The box also sets `user-select: text` on
its paragraph, since svelte-draw turns text selection off inside its container by default.
