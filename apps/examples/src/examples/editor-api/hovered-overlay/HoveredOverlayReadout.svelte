<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'

	const editor = getEditor()
	const hovered = fromComputed('hoveredOverlay', () => editor.overlays.getHoveredOverlay())
</script>

<div class="hovered-overlay-readout">
	{#if hovered.current}
		<div>
			<span>type</span>
			<code>{hovered.current.type}</code>
		</div>
		<div>
			<span>id</span>
			<code>{hovered.current.id}</code>
		</div>
	{:else}
		<div class="hovered-overlay-readout__empty">Select a shape, then hover its handles</div>
	{/if}
</div>
