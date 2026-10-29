<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import SaveButton from './SaveButton.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		TopPanel: SaveButton,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
The save button lives in `SaveButton.svelte`.

[1]
Rather than a boolean "dirty" flag, we accumulate every change since the last save into a
single `RecordsDiff`. `squashRecordDiffs` folds each new transaction into it, so a shape that
was created and then deleted cancels out, and a shape edited ten times shows up as one update
from its saved state to its current state. Because the squash mutates in place, the diff is a
plain variable rather than `$state`; the boolean `$state` is only there to update the button.

[2]
`scope: 'document'` limits the listener to records that are part of the persisted document
(shapes, pages, assets, bindings, the document record). Session state like the camera,
selection, and current page still writes to the store but shouldn't count as unsaved work.
`store.listen` returns its unsubscribe function, so it doubles as the effect's cleanup.

[3]
When saving, you have two things to send: the accumulated diff (small, and exactly what
changed) or a full snapshot from `editor.getSnapshot()` (simpler to store and restore). Which
you use depends on your backend. Either way, reset the diff afterwards so it starts tracking
from the newly saved state.
-->
