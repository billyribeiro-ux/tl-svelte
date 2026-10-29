---
title: Custom shape wrapper
component: ./CustomShapeWrapperExample.svelte
keywords:
  [
    ShapeWrapper,
    DefaultShapeWrapper,
    wrapper,
    dom,
    class names,
    styling,
    css,
    atom,
    forwardRef,
    components,
  ]
---

Add a class name to individual shapes by overriding the `ShapeWrapper` component.

---

Every shape is rendered inside a wrapper element that svelte-draw positions on the canvas. Passing a component as `components.ShapeWrapper` replaces that element. The custom wrapper here renders `DefaultShapeWrapper` (so positioning still works) and adds a `custom-special-shape` class when the shape's id matches an `atom`. Reading the atom with `fromComputed` means only the affected wrappers update.

A timer moves the "special" status to a random shape every second, so you'll see a red drop shadow jump between the geo shapes. This is useful for styling or tagging shapes from outside the shape util, for example to add data attributes for CSS targeting.
