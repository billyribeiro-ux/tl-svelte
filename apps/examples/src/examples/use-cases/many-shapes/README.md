---
title: Many shapes
component: ./ManyShapesExample.svelte
priority: 5
keywords: [performance, stress test, many shapes, LOD, level of detail, culling]
---

Populate the canvas with hundreds of shapes to see svelte-draw's performance optimizations in action.

---

This example creates a large number of shapes to demonstrate how svelte-draw handles dense canvases. Try zooming out to see level-of-detail transitions: sticky note shadows disappear, draw-style strokes simplify to solid paths, and pattern fills flatten to solid colors.

Use "Zoom to fit" in the zoom menu (bottom left) to see all shapes at once and observe how culling, debounced zoom, and LOD work together.
