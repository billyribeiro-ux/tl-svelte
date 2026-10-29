---
title: Signals
component: ./StateStoreExample.svelte
priority: 0
keywords:
  [signals, reactive, track, usevalue, usereactor, state management, side effects, computed, atom]
---

Keep Svelte components and side effects in sync with editor state using `fromComputed`, `fromSignal`, and `quickReactor`.

---

svelte-draw's editor state is made of signals: every `editor.get...()` call reads one, and Svelte
does not track those reads by itself. This example shows the two bridges from `@svelte-draw/svelte`.
`fromComputed` wraps a function that reads signals and exposes its result as `.current`, so a
template re-renders only when the returned value changes (`fromSignal` does the same for a single
signal). `quickReactor` runs a side effect (here, updating the document title with the shape count)
whenever the signals it reads change.

Try switching tools, zooming, and adding shapes: the panel above the style panel and the browser
tab title both update. The panel lives in `InfoPanel.svelte`.
