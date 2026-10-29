---
title: Custom paste behavior
component: ./CustomPasteExample.svelte
priority: 3
keywords: [paste, clipboard, external content, handler]
---

Replace the built-in paste handler so a copied frame lands in free space beside the original.

---

Pasted svelte-draw content goes through the `'svelte-draw'` external content handler. This example overrides it with `editor.registerExternalContentHandler('svelte-draw', ...)` to add one rule: when the clipboard holds a single page-level frame, place the pasted copy to the right of the original (and past any other frames in the way), the way Figma does. Everything else falls through to `defaultHandleExternalSvelteDrawContent`.

Try creating a frame, then pressing `Cmd + C`, `Cmd + V` a few times.
