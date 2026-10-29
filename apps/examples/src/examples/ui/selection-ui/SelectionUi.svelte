<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import DuplicateInDirectionButton from './DuplicateInDirectionButton.svelte'

	// [1]
	const editor = getEditor()

	// [2]
	const info = fromComputed('selection bounds', () => {
		const screenBounds = editor.getViewportScreenBounds()
		const rotation = editor.getSelectionRotation()
		const rotatedScreenBounds = editor.getSelectionRotatedScreenBounds()
		if (!rotatedScreenBounds) return
		return {
			x: rotatedScreenBounds.x - screenBounds.x,
			y: rotatedScreenBounds.y - screenBounds.y,
			width: rotatedScreenBounds.width,
			height: rotatedScreenBounds.height,
			rotation,
		}
	})
</script>

{#if info.current}
	{@const i = info.current}
	<div
		style:position="absolute"
		style:top="0"
		style:left="0"
		style:transform-origin="top left"
		style:transform="translate({i.x}px, {i.y}px) rotate({i.rotation}rad)"
		style:pointer-events="all"
	>
		<DuplicateInDirectionButton y={-40} x={i.width / 2 - 16} rotation={-Math.PI / 2} />
		<DuplicateInDirectionButton y={i.height / 2 - 16} x={i.width + 8} rotation={0} />
		<DuplicateInDirectionButton y={i.height + 8} x={i.width / 2 - 16} rotation={Math.PI / 2} />
		<DuplicateInDirectionButton y={i.height / 2 - 16} x={-40} rotation={Math.PI} />
	</div>
{/if}
