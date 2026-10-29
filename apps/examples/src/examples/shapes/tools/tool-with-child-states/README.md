---
title: Custom tool with child states
component: ./ToolWithChildStatesExample.svelte
priority: 2
keywords:
  [
    custom tool,
    state machine,
    StateNode,
    child states,
    tool states,
    onPointerDown,
    onPointerMove,
    onEnter,
    transitions,
    pointing,
    dragging,
    idle,
  ]
---

Split a custom tool into idle, pointing, and dragging child states to tell clicks from drags.

---

Tools are `StateNode`s in svelte-draw's state machine. Once a tool needs to distinguish a click from a drag, or a click on empty canvas from a click on a shape, giving it child states keeps each piece of behavior in the state that owns it: `Idle` decides what the user is doing, `Pointing` waits to see whether a drag starts, and `Dragging` updates the shape. `this.parent.transition()` moves between them and passes data to the next state's `onEnter`.

This builds on the custom tool example. Instructions for what to try are drawn on the canvas.
