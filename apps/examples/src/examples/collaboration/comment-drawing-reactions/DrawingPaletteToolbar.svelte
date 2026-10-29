<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import {
		DrawingReactionTooLargeError,
		exportDrawingImage,
		type DrawingReactionPaletteProps,
	} from './drawingReactions'

	/** The bar over the bottom of the drawing box. Renders as a child of the palette's own editor. */
	let {
		exportOptions,
		submitLabel,
		onSelect,
		saveDrawing,
	}: Pick<
		DrawingReactionPaletteProps,
		'exportOptions' | 'submitLabel' | 'onSelect' | 'saveDrawing'
	> = $props()

	const editor = getEditor()
	const tool = fromComputed('drawing palette tool', () => editor.getCurrentToolId())
	const isEmpty = fromComputed(
		'drawing palette is empty',
		() => editor.getCurrentPageShapeIds().size === 0
	)
	let isExporting = $state(false)
	let error = $state<string | null>(null)

	function clear() {
		error = null
		editor.deleteShapes([...editor.getCurrentPageShapeIds()])
		editor.setCurrentTool('draw')
	}

	async function submit() {
		error = null
		isExporting = true
		try {
			const src = await exportDrawingImage(editor, exportOptions)
			if (src) {
				const token = saveDrawing ? await saveDrawing(src) : src
				onSelect?.(token)
			}
		} catch (e) {
			error =
				e instanceof DrawingReactionTooLargeError
					? 'That drawing is too detailed — try something simpler.'
					: "Couldn't export that drawing."
		} finally {
			isExporting = false
		}
	}
</script>

{#snippet toolButton(label: string, active: boolean, onclick: () => void, icon: 'pen' | 'eraser')}
	<button
		type="button"
		class={[
			'tlui-cmt-drawing-palette__tool',
			active && 'tlui-cmt-drawing-palette__tool--active',
		]}
		aria-label={label}
		title={label}
		aria-pressed={active}
		{onclick}
	>
		<svg
			width="15"
			height="15"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			stroke-width="1.3"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			{#if icon === 'pen'}
				<path d="M11.2 2.3a1.6 1.6 0 0 1 2.3 2.3L5.4 12.7l-3 .7.7-3z" />
				<path d="M10.1 3.4 12.4 5.7" />
			{:else}
				<path
					d="M8.8 2.9 3 8.7a1.4 1.4 0 0 0 0 2l2 2a1.4 1.4 0 0 0 1 .4h2.4l4.4-4.4a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0z"
				/>
				<path d="M5.9 5.8 10.9 10.8M6.4 13.1h6.7" />
			{/if}
		</svg>
	</button>
{/snippet}

{#if error}
	<div class="tlui-cmt-drawing-palette__error" role="alert">
		{error}
	</div>
{/if}
<div class="tlui-cmt-drawing-palette__toolbar">
	{@render toolButton('Pen', tool.current === 'draw', () => editor.setCurrentTool('draw'), 'pen')}
	{@render toolButton(
		'Eraser',
		tool.current === 'eraser',
		() => editor.setCurrentTool('eraser'),
		'eraser'
	)}
	<button
		type="button"
		class="tlui-cmt-drawing-palette__text-button"
		onclick={clear}
		disabled={isEmpty.current}
	>
		Clear
	</button>
	<div class="tlui-cmt-drawing-palette__spacer"></div>
	<button
		type="button"
		class="tlui-cmt-drawing-palette__submit"
		onclick={submit}
		disabled={isEmpty.current || isExporting}
	>
		{submitLabel}
	</button>
</div>
