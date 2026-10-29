<script lang="ts">
	import {
		DefaultToolbar,
		DefaultToolbarContent,
		type DefaultToolbarProps,
		SvelteDrawUiMenuItem,
		fromComputed,
		getEditor,
		getTools,
	} from 'svelte-draw'

	let props: Omit<DefaultToolbarProps, 'children'> = $props()

	const tools = getTools()
	const editor = getEditor()
	const pen = $derived(tools.current.pen)
	const isPenSelected = fromComputed('is pen tool', () => editor.isIn('pen'))
</script>

<DefaultToolbar {...props}>
	{#if pen}
		<SvelteDrawUiMenuItem {...pen} isSelected={isPenSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
