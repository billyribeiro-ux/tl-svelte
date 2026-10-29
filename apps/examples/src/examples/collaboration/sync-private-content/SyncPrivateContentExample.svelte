<script lang="ts">
	import { createSyncDemo } from '@svelte-draw/sync'
	import { atom, react, SvelteDraw, type Editor, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { setContext } from 'svelte'
	import PrivateModePanel from './PrivateModePanel.svelte'
	import { PRIVATE_MODE_KEY } from './privateMode'
	import './style.css'

	// There's a guide at the bottom of this file!

	let { roomId }: { roomId?: string } = $props()

	// [1]
	const isPrivateMode$ = atom('isPrivateDrawingMode', false)
	setContext(PRIVATE_MODE_KEY, isPrivateMode$)

	// [2]
	const components: TLComponents = {
		InFrontOfTheCanvas: PrivateModePanel,
	}

	const sync = createSyncDemo(() => ({ roomId: roomId! }))

	// [4]
	function getShapeVisibility(
		shape: { meta: Record<string, unknown> },
		editor: Editor
	): 'hidden' | 'inherit' {
		const userId = editor.user.getExternalId()
		if (!!shape.meta.private && shape.meta.ownerId !== userId) {
			return 'hidden'
		}
		return 'inherit'
	}

	function onMount(editor: Editor) {
		// [5]
		const removeCreateHandler = editor.store.sideEffects.registerBeforeCreateHandler(
			'shape',
			(shape) => {
				if ('private' in shape.meta) return shape
				return {
					...shape,
					meta: {
						...shape.meta,
						private: isPrivateMode$.get(),
						ownerId: editor.user.getExternalId(),
					},
				}
			}
		)

		// [6]
		const stopCleaningSelection = react('clean up selection', () => {
			const selectedShapes = editor.getSelectedShapes()
			const filteredSelectedShapes = selectedShapes.filter((s) => !editor.isShapeHidden(s))
			if (filteredSelectedShapes.length !== selectedShapes.length) {
				editor.select(...filteredSelectedShapes)
			}
		})

		return () => {
			removeCreateHandler()
			stopCleaningSelection()
		}
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		store={sync.current}
		options={{ deepLinks: true }}
		{getShapeVisibility}
		{onMount}
		{components}
	/>
</div>

<!--
A 'private' drawing mode: shapes created while it is on are tagged with the creator's id and hidden
from everyone else. Selecting your own private shapes offers to make them public.

[1]
A context holding the atom for the private-mode flag. Signals are used here, but any state
container works.

[2]
The `InFrontOfTheCanvas` slot hosts a small panel that toggles private mode, or, when private shapes
are selected, offers to make them public.

[3]
`fromSignal` on the atom gives the panel a reactive read of the flag.

[4]
`getShapeVisibility` hides shapes that are private and owned by someone else. Hidden shapes are
still in the store and still sync; they're just not rendered or hittable for this user.

[5]
A before-create side effect stamps every new shape with `private` and `ownerId` meta. Because it
runs in the store, it covers every creation path (tools, paste, duplicate), not just the ones this
UI knows about. `onMount` returns a cleanup so the handler and the reaction below are removed when
the editor unmounts.

[6]
A reaction that drops hidden shapes from the selection. Without it, toggling private mode while a
now-hidden shape is selected would leave an invisible selection.

[7]
Child shapes inside groups and frames don't inherit their parent's `private` meta, so making a
shape public also makes its descendants public, which is what the user almost certainly meant.
-->
