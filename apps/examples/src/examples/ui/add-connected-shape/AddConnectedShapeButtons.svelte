<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import { on } from 'svelte/events'
	import type { Attachment } from 'svelte/attachments'
	import { BUTTON_OFFSET, DIRECTIONS, addConnectedShape } from './addConnectedShape'

	const editor = getEditor()

	// [5]
	// Reads the select tool state, the selection, the shape's bounds and the camera, so it
	// recomputes whenever any of them change (this replaces React's `track()`).
	const target = fromComputed('add connected shape target', () => {
		if (!editor.isIn('select.idle')) return null

		const shape = editor.getOnlySelectedShape()
		if (!shape || editor.isShapeOfType(shape, 'arrow')) return null

		const bounds = editor.getShapePageBounds(shape.id)
		if (!bounds) return null

		return {
			shape,
			buttons: DIRECTIONS.map((direction) => {
				// [6]
				const edgeMidpoint = editor.pageToViewport({
					x: bounds.center.x + direction.dx * (bounds.width / 2),
					y: bounds.center.y + direction.dy * (bounds.height / 2),
				})
				return { direction, x: edgeMidpoint.x, y: edgeMidpoint.y }
			}),
		}
	})

	// Svelte delegates `pointerdown`, so stopPropagation has to happen on a native listener.
	const stopPointerDown: Attachment<HTMLButtonElement> = (element) =>
		on(element, 'pointerdown', (e) => e.stopPropagation())
</script>

{#if target.current}
	{@const { shape, buttons } = target.current}
	{#each buttons as { direction, x, y } (direction.name)}
		<button
			class="add-connected-button"
			style:transform={`translate(${x + direction.dx * BUTTON_OFFSET}px, ${y + direction.dy * BUTTON_OFFSET}px)`}
			{@attach stopPointerDown}
			onclick={() => addConnectedShape(editor, shape, direction)}
		>
			+
		</button>
	{/each}
{/if}
