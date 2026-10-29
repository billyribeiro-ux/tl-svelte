<script lang="ts">
	import { SvelteDraw, DefaultSizeStyle, type Editor } from 'svelte-draw'
	import DrawingPaletteToolbar from './DrawingPaletteToolbar.svelte'
	import DrawingReactionContent from './DrawingReactionContent.svelte'
	import {
		DRAWING_EDITOR_OPTIONS,
		DRAWING_EDITOR_OVERRIDES,
		isDrawingReactionToken,
		type DrawingReactionPaletteProps,
	} from './drawingReactions'

	/**
	 * A palette that lets you draw your own reaction: a small square svelte-draw canvas with a locked
	 * camera, a pen, and an eraser — nothing else — plus a button that exports what's on it, saves it
	 * via `saveDrawing`, and emits the resulting token.
	 *
	 * Prop-compatible with `EmojiPicker`, so it drops into the same slot; unlike `EmojiPicker` it
	 * renders its own editor, so it doesn't need an editor context of its own and can be staged
	 * standalone.
	 */
	let {
		emoji,
		selected,
		onSelect,
		saveDrawing,
		renderReaction,
		size = 'clamp(180px, 25vmin, 320px)',
		exportOptions,
		licenseKey,
		submitLabel = 'React',
	}: DrawingReactionPaletteProps = $props()

	// A thicker brush than the draw tool's default: the drawing is displayed at pill size, where
	// a default-weight stroke thins out to nothing. Scoped to the palette's own editor.
	function handleMount(editor: Editor) {
		editor.setStyleForNextShapes(DefaultSizeStyle, 'l')
	}

	// The palette is portaled into the host editor's container, so a wheel event that escapes it
	// lands on the host canvas and zooms the document behind the menu. The nested editor's camera
	// is locked, so it has no reason to want the event either — it stops here.
	function stopPropagation(event: Event) {
		event.stopPropagation()
	}
	const cssSize = $derived(typeof size === 'number' ? `${size}px` : size)
</script>

{#snippet defaultReaction(token: string)}
	<DrawingReactionContent {token} />
{/snippet}

<div class="tlui-cmt-drawing-palette" onwheel={stopPropagation}>
	{#if emoji && emoji.length > 0}
		<div class="tlui-cmt-drawing-palette__reuse" role="group">
			{#each emoji as token (token)}
				{@const active = selected?.includes(token) ?? false}
				<button
					type="button"
					class={[
						'tlui-cmt-drawing-palette__reuse-item',
						active && 'tlui-cmt-drawing-palette__reuse-item--active',
					]}
					aria-label={isDrawingReactionToken(token) ? 'Drawn reaction' : token}
					aria-pressed={active}
					onclick={() => onSelect?.(token)}
				>
					{@render (renderReaction ?? defaultReaction)(token)}
				</button>
			{/each}
		</div>
	{/if}

	<div class="tlui-cmt-drawing-palette__canvas" style:width={cssSize} style:height={cssSize}>
		<SvelteDraw
			hideUi
			initialState="draw"
			{licenseKey}
			options={DRAWING_EDITOR_OPTIONS}
			overrides={DRAWING_EDITOR_OVERRIDES}
			onMount={handleMount}
		>
			<!-- Inside the editor rather than beside it: the toolbar reads the tool and the emptiness
				straight off `getEditor()`, so there's no editor instance to lift out into component
				state and nothing that leaves the buttons inert if the lift fails. -->
			<DrawingPaletteToolbar {exportOptions} {submitLabel} {onSelect} {saveDrawing} />
		</SvelteDraw>
	</div>
</div>
