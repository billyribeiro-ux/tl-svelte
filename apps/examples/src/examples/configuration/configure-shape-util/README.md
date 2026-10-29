---
title: Shape options
component: ./ConfigureShapeUtilExample.svelte
priority: 0
keywords:
  [
    configure,
    shapeutil,
    shape options,
    noteshapeoptions,
    frameshapeoptions,
    builtin shapes,
    customization,
  ]
---

Change the behavior of built-in shapes with `ShapeUtil.configure`.

---

Several built-in shape utils expose an `options` object. `ShapeUtil.configure(options)` returns a subclass of the util with those options overridden, and passing that subclass in the `shapeUtils` prop replaces the default one.

You can find a shape's options in the `options` property of its util, for example `NoteShapeOptions` and `FrameShapeOptions`. Here notes get `resizeMode: 'scale'` so they can be resized by dragging a handle, and frames get `showColors: true` so the color style applies to them.

Try creating a note (N) and dragging a corner handle, or a frame (F) and changing its color in the style panel.
