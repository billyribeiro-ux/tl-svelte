<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import { fromComputed, getEditor, type TLShapeId } from 'svelte-draw'
	import { BOARD_HEADER_HEIGHT, BOARD_LAYOUTS, type BoardLayoutMode } from './BoardLayouts'

	let {
		id,
		w,
		h,
		name,
		layout,
	}: { id: TLShapeId; w: number; h: number; name: string; layout: BoardLayoutMode } = $props()

	const editor = getEditor()
	// Re-created when `id` changes, like the `[editor, shape.id]` deps of the `useValue` it replaces.
	const count = $derived(
		fromComputed('card count', () => editor.getSortedChildIdsForParent(id).length)
	)
</script>

<HTMLContainer class="layout-board" style="width: {w}px; height: {h}px;">
	<div class="layout-board__header" style="height: {BOARD_HEADER_HEIGHT}px;">
		<span class="layout-board__name">{name}</span>
		<span class="layout-board__badge">
			{BOARD_LAYOUTS[layout].label} · {count.current}
		</span>
	</div>
</HTMLContainer>
