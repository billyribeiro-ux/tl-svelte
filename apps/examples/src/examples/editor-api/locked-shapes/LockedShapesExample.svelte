<script lang="ts">
	import { fromSignal } from '@svelte-draw/svelte'
	import { SvelteDraw, toRichText, type Editor, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './locked-shapes.css'
	import LockedShapesControlPanel from './LockedShapesControlPanel.svelte'
	import { selectLockedShapes$ } from './lockedShapesState'
	import { HOME_POSITIONS, TEMPLATE_IDS } from './templates'

	// There's a guide at the bottom of this file!

	const selectLockedShapes = fromSignal(selectLockedShapes$)

	const components: TLComponents = {
		TopPanel: LockedShapesControlPanel,
	}

	// [3]
	function handleMount(editor: Editor) {
		if (!editor.getShape(TEMPLATE_IDS[0])) {
			const props = {
				geo: 'rectangle' as const,
				w: 130,
				h: 130,
				dash: 'dashed' as const,
				color: 'light-blue' as const,
				fill: 'semi' as const,
				richText: toRichText('Locked'),
			}
			editor.createShapes(
				TEMPLATE_IDS.map((id, i) => ({ id, type: 'geo', ...HOME_POSITIONS[i], props }))
			)
			editor.toggleLock(TEMPLATE_IDS)
		}
		editor.zoomToFit({ animation: { duration: 0 } })
	}

	const options = $derived({ selectLockedShapes: selectLockedShapes.current })
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} {options} onMount={handleMount} />
</div>

<!--
Locked shapes can't be moved, resized, edited, or deleted by the user. This example shows two ways the
editor lets you work around that:

- `editor.run(fn, { ignoreShapeLock: true })` lifts the lock guard for the duration of the callback, so
  code can move shapes the user can't drag.
- The `selectLockedShapes` editor option lets locked shapes be selected by left-click, brush, and
  scribble selection. Only selection changes; the lock guards still apply to everything else.

Try it: left-click a blue shape and nothing happens (right-click still selects it). Turn on "Allow
selecting locked shapes" and left-click or brush across one; it selects, but the handles won't move it.
Scatter and Reset move the shapes regardless of the toggle.

[1]
The toggle lives in a module-level `atom` (lockedShapesState.ts) so both the control panel (inside the
editor) and the example component (outside it) can read it with `fromSignal`. Editor options are
read-only once the editor is created, so the example passes a new `options` object to `<SvelteDraw>`,
which recreates the editor with the new setting. The store is preserved, so the shapes and camera
survive the swap.

[2]
Both buttons wrap `updateShapes` in `editor.run` with `ignoreShapeLock: true`. Without it, updates to
locked shapes are silently dropped.

[3]
On mount, create a 2x2 grid of shapes and lock them with `toggleLock`. `onMount` runs again whenever the
editor is recreated, so it checks whether the shapes already exist first.
-->
