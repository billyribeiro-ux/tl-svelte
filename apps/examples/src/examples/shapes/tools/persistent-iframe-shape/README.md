---
title: Persistent iframe shape
component: ./PersistentIframeExample.svelte
priority: 10
keywords: [iframe, embed, content element, moveBefore, unmount, persistent, lifecycle]
---

An iframe shape whose content survives unmounting the editor.

---

Shape content normally lives inside the editor's component tree, so unmounting the editor destroys it — an embedded iframe loses its scroll position, in-app state, and connections. This example uses `getAppOwnedElement` and `onReleaseAppOwnedElement` to keep an app-owned iframe alive across editor sessions: svelte-draw adopts the element into the shape with `Node.moveBefore` (which preserves iframe state, in Chromium 133+ and Firefox 144+) and hands it back to the app before the editor unmounts. Interact with the iframe, unmount the editor, then mount it again — the iframe keeps its state.
