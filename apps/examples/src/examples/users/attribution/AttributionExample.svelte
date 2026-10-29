<script lang="ts">
	import { SvelteDraw, type Editor, type TLShape } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './attribution.css'
	import AttributionPanel from './AttributionPanel.svelte'
	import { users } from './attributionUsers'
	import UserSwitcher from './UserSwitcher.svelte'

	// There's a guide at the bottom of this file!

	const components = {
		TopPanel: UserSwitcher,
		SharePanel: AttributionPanel,
	}

	// [6]
	function handleMount(editor: Editor) {
		const stampWithCurrentUser = (shape: TLShape) => {
			if (typeof shape.meta.createdBy === 'string') return shape
			const userId = editor.getAttributionUserId()
			if (!userId) return shape
			return { ...shape, meta: { ...shape.meta, createdBy: userId } }
		}

		// Shapes persisted before this example started stamping get attributed to whoever is
		// current on load, without polluting the undo stack
		const toBackfill = editor
			.getCurrentPageShapes()
			.filter((s) => typeof s.meta.createdBy !== 'string')
			.map(stampWithCurrentUser)
		if (toBackfill.length) {
			editor.run(() => editor.updateShapes(toBackfill), { history: 'ignore' })
		}

		editor.sideEffects.registerBeforeCreateHandler('shape', stampWithCurrentUser)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="attribution-example"
		{users}
		onMount={handleMount}
		{components}
	/>
</div>

<!--
[1]
A fake user directory in a reactive atom (`attributionUsers.ts`). In a real app this would be
backed by your auth system. Because it's an atom, changes (like renaming a user) propagate to
anything reading through the `TLUserStore`.

[2]
The `TLUserStore`. `currentUser` and `resolve` are signals, so `fromSignal` and computeds
that read them re-evaluate when the underlying data changes. `createCachedUserResolve`
returns the same signal for repeated lookups of the same id, which the editor relies on
to avoid recomputation.

[3]
Switch which user is "logged in" and edit the active user's name. Draw a shape as Alice,
rename her, and the attribution panel updates live. Switch to Bob and edit a note's text
to see the built-in "Text last edited by" appear.

[4]
The panel shows the current user and, for the selected shape, resolves `meta.createdBy`
(set by our side effect) and `textLastEditedBy` (built into note shapes). Both are user
id strings; `resolve(userId).get()` turns them into live display data.

[5]
Read `meta.createdBy` for any shape, plus the built-in `textLastEditedBy` prop on notes.

[6]
`editor.getAttributionUserId()` returns the current user's id (and makes sure a `user:`
record exists for them). A `beforeCreate` side effect stamps it onto every new shape's
`meta.createdBy`, which lets you attribute any shape type, not just notes.
-->
