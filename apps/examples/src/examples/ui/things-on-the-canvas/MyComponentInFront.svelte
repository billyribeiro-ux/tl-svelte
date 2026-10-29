<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	// [2]
	const editor = getEditor()
	const position = fromComputed('selection position', () => {
		const bounds = editor.getSelectionRotatedPageBounds()
		if (!bounds) return null
		return editor.pageToViewport(bounds.point)
	})
</script>

{#if position.current}
	<div
		class="in-front-of-the-canvas-card"
		style:top="{Math.max(64, position.current.y - 64)}px"
		style:left="{Math.max(64, position.current.x)}px"
	>
		<p>This won’t scale with zoom.</p>
	</div>
{/if}
