<script lang="ts">
	import { getStylePanelContext, StylePanelSizePicker } from 'svelte-draw'
	import { strokeSizeStyle } from './strokeSize'

	const STROKE_SIZE_PRESETS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 26, 32]

	// [4]
	// `styles` is a live getter on the context, so read it inside `$derived` or the template.
	const ctx = getStylePanelContext()
	const strokeSize = $derived(ctx.styles.get(strokeSizeStyle))
	const value = $derived(!strokeSize || strokeSize.type === 'mixed' ? null : strokeSize.value)
</script>

<!-- [5] -->
{#if strokeSize === undefined}
	<StylePanelSizePicker />
{:else}
	<div class="stroke-size-picker">
		{#each STROKE_SIZE_PRESETS as size (size)}
			<button
				class="stroke-size-picker__preset"
				data-active={value === size}
				title={`Stroke size ${size}`}
				onclick={() => {
					ctx.onHistoryMark('set stroke size')
					ctx.onValueChange(strokeSizeStyle, size)
				}}
			>
				<div
					class="stroke-size-picker__dot"
					style:width="{4 + size / 2}px"
					style:height="{4 + size / 2}px"
				></div>
			</button>
		{/each}
	</div>
{/if}
