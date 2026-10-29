---
title: Toolbar groups
component: ./ToolbarGroupsExample.svelte
keywords:
  [
    toolbar,
    toolbar groups,
    SvelteDrawUiMenuGroup,
    DefaultToolbar,
    customize toolbar,
    toolbar items,
    toolbar layout,
    orientation,
  ]
---

Split the toolbar into labelled groups with dividers between them.

---

Pass children to `DefaultToolbar` to replace its default items. Wrap related items in `SvelteDrawUiMenuGroup` to draw a divider between groups; the built-in `*ToolbarItem` components (`SelectToolbarItem`, `DrawToolbarItem`, `RectangleToolbarItem`, and so on) give you the standard tools. Any menu item works in the toolbar too. Here the first group is a plain `SvelteDrawUiMenuItem` that toggles the toolbar between horizontal and vertical, so you can see how groups lay out in both orientations.
