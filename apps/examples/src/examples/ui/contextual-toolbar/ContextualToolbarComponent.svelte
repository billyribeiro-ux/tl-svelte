<script lang="ts">
	import {
		Box,
		DefaultSizeStyle,
		fromComputed,
		getEditor,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiContextualToolbar,
		SvelteDrawUiToolbarButton,
	} from 'svelte-draw'

	const SIZES = [
		{ value: 's', icon: 'size-small' },
		{ value: 'm', icon: 'size-medium' },
		{ value: 'l', icon: 'size-large' },
		{ value: 'xl', icon: 'size-extra-large' },
	] as const

	// [1]
	const editor = getEditor()
	const showToolbar = fromComputed('show toolbar', () => editor.isIn('select.idle'))

	// [2]
	const size = fromComputed('shared size style', () => editor.getSharedStyles().get(DefaultSizeStyle))
	const currentSize = $derived(size.current?.type === 'shared' ? size.current.value : undefined)

	// [3]
	const getSelectionBounds = () => {
		const fullBounds = editor.getSelectionRotatedScreenBounds()
		if (!fullBounds) return undefined
		return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0)
	}
</script>

{#if size.current && showToolbar.current}
	<SvelteDrawUiContextualToolbar {getSelectionBounds} label="Sizes">
		{#each SIZES as { value, icon } (value)}
			<SvelteDrawUiToolbarButton
				title={value.toUpperCase()}
				type="icon"
				isActive={value === currentSize}
				onclick={() => editor.setStyleForSelectedShapes(DefaultSizeStyle, value)}
			>
				<SvelteDrawUiButtonIcon small {icon} />
			</SvelteDrawUiToolbarButton>
		{/each}
	</SvelteDrawUiContextualToolbar>
{/if}
