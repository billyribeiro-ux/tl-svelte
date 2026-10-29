<script lang="ts">
	import {
		Box,
		SvelteDrawUiContextualToolbar,
		SvelteDrawUiToolbarButton,
		fromComputed,
		getEditor,
	} from 'svelte-draw'
	import { BOARD_LAYOUTS, type BoardLayoutMode } from './BoardLayouts'
	import { animateBoardLayout, BOARD_SHAPE_TYPE, type BoardShape } from './LayoutBoardShapeUtil'

	// [8]
	const editor = getEditor()
	const board = fromComputed('selected board', () => {
		if (!editor.isIn('select.idle')) return null
		const shape = editor.getOnlySelectedShape()
		return shape?.type === BOARD_SHAPE_TYPE ? (shape as BoardShape) : null
	})

	function setLayout(current: BoardShape, layout: BoardLayoutMode) {
		editor.markHistoryStoppingPoint('change board layout')
		editor.run(() => {
			editor.updateShape({ id: current.id, type: current.type, props: { layout } })
			animateBoardLayout(editor, current.id)
		})
		editor.getContainer().focus()
	}

	const getSelectionBounds = () => {
		const bounds = editor.getSelectionRotatedScreenBounds()
		return bounds ? new Box(bounds.x, bounds.y, bounds.width, 0) : undefined
	}
</script>

{#if board.current}
	{@const current = board.current}
	<SvelteDrawUiContextualToolbar {getSelectionBounds} label="Board layout">
		{#each Object.entries(BOARD_LAYOUTS) as [mode, { label }] (mode)}
			<SvelteDrawUiToolbarButton
				type="icon"
				title={label}
				isActive={current.props.layout === mode}
				onclick={() => setLayout(current, mode as BoardLayoutMode)}
			>
				{label}
			</SvelteDrawUiToolbarButton>
		{/each}
	</SvelteDrawUiContextualToolbar>
{/if}
