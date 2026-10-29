<script lang="ts">
	import {
		DefaultKeyboardShortcutsDialog,
		DefaultKeyboardShortcutsDialogContent,
		SvelteDrawUiMenuItem,
		type TLUiKeyboardShortcutsDialogProps,
		getTools,
	} from 'svelte-draw'

	// The dialog is rendered with the props the UI passes to its KeyboardShortcutsDialog slot.
	let props: Omit<TLUiKeyboardShortcutsDialogProps, 'children'> = $props()

	const tools = getTools()
	const speechTool = $derived(tools.current['speech'])
</script>

<DefaultKeyboardShortcutsDialog {...props}>
	{#if speechTool}
		<SvelteDrawUiMenuItem {...speechTool} />
	{/if}
	<DefaultKeyboardShortcutsDialogContent />
</DefaultKeyboardShortcutsDialog>
