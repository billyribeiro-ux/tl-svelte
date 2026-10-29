<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import DrawShapeCounter from './DrawShapeCounter.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		TopPanel: DrawShapeCounter,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="derived-view" {components} />
</div>

<!--
Signals let you derive a value from the store and have it stay up to date. The naive way to
count draw shapes is to loop over every shape each time anything changes. That's fine for
small documents, but on large ones it's wasted work: most changes don't touch draw shapes at
all. This example builds a computed set of draw shape ids (in deriveDrawShapeIds.ts) that updates
itself incrementally from the store's change history.

[1]
The derivation is created once per editor (the component is created once per editor) and read
with `fromSignal`. The component only re-renders when the derived `count` changes, so moving or
restyling shapes doesn't touch the DOM at all.

[2]
`store.query.ids('shape')` is a reactive set of every shape id in the store. We only use it for
the from-scratch pass; the incremental path reads diffs instead.

[3]
The first time a `computed` runs, `prevValue` is a special uninitialized sentinel, so there's
nothing to diff against and we compute from scratch.

[4]
`store.history` is an atom whose value is a change counter and whose diffs are the record
changes between updates. `getDiffSince(lastComputedEpoch)` returns every change since our last
run, or `RESET_VALUE` if the history buffer no longer goes back that far (or the store was
reset), in which case we start over.

[5]
Walk the diffs and only allocate a new set if a draw shape was actually added or removed.
Updates to existing draw shapes don't change membership, so we skip `changes.updated`.

[6]
Returning `prevValue` when nothing changed means downstream signals (and `fromSignal`) see the
same reference and don't recompute. That's what makes the incremental approach cheap.
-->
