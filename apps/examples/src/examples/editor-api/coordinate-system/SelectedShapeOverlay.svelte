<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()

	// [4]
	const overlay = fromComputed('selected shape overlay', () => {
		const selectedShapeId = editor.getOnlySelectedShapeId()
		if (!selectedShapeId) return null
		const pageBounds = editor.getShapePageBounds(selectedShapeId)
		if (!pageBounds) return null
		// [5]
		const topLeft = editor.pageToViewport(pageBounds.point)
		return { pageBounds, topLeft }
	})
</script>

{#if overlay.current}
	<div
		class="shape-overlay"
		style:left="{overlay.current.topLeft.x}px"
		style:top="{overlay.current.topLeft.y - 32}px"
	>
		Page: ({overlay.current.pageBounds.x.toFixed(0)}, {overlay.current.pageBounds.y.toFixed(0)})
	</div>
{/if}
