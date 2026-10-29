<script lang="ts">
	import { fromSignal, getEditor } from '@svelte-draw/svelte'
	import { SvelteDrawUiButton } from 'svelte-draw'
	import { HOME_POSITIONS, TEMPLATE_IDS } from './templates'
	import { selectLockedShapes$ } from './lockedShapesState'

	const editor = getEditor()
	const selectLockedShapes = fromSignal(selectLockedShapes$)

	// [2]
	function moveTemplates(positions: { x: number; y: number }[]) {
		editor.run(
			() => {
				editor.updateShapes(TEMPLATE_IDS.map((id, i) => ({ id, type: 'geo', ...positions[i] })))
			},
			{ ignoreShapeLock: true }
		)
	}

	function handleScatter() {
		moveTemplates(
			TEMPLATE_IDS.map(() => ({ x: 50 + Math.random() * 300, y: 50 + Math.random() * 300 }))
		)
	}
</script>

<div class="tlui-menu locked-shapes-panel">
	<label title="When on, left-click and brush selection include locked shapes.">
		<input
			type="checkbox"
			checked={selectLockedShapes.current}
			onchange={() => selectLockedShapes$.set(!selectLockedShapes.current)}
		/>
		Allow selecting locked shapes
	</label>
	<SvelteDrawUiButton type="normal" onclick={handleScatter}>Scatter</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={() => moveTemplates(HOME_POSITIONS)}>
		Reset
	</SvelteDrawUiButton>
</div>
