<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		onMount={(editor) => {
			// Rewriting to the last id (rather than rejecting) keeps brushing and select-all usable.
			editor.sideEffects.registerBeforeChangeHandler('instance_page_state', (prev, next) => {
				if (prev.selectedShapeIds !== next.selectedShapeIds && next.selectedShapeIds.length > 1) {
					return {
						...next,
						selectedShapeIds: [next.selectedShapeIds[next.selectedShapeIds.length - 1]],
					}
				}
				return next
			})
		}}
	/>
</div>
