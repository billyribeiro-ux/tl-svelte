<script lang="ts">
	import {
		DefaultKeyboardShortcutsDialog,
		DefaultKeyboardShortcutsDialogContent,
		SvelteDrawUiMenuItem,
		type TLUiKeyboardShortcutsDialogProps,
		getTools,
	} from 'svelte-draw'

	let props: Omit<TLUiKeyboardShortcutsDialogProps, 'children'> = $props()

	const tools = getTools()
	const tool = $derived(tools.current['PlayingCard'])
</script>

<DefaultKeyboardShortcutsDialog {...props}>
	{#if tool}
		<SvelteDrawUiMenuItem {...tool} />
	{/if}
	<DefaultKeyboardShortcutsDialogContent />
</DefaultKeyboardShortcutsDialog>
