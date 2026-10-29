<script lang="ts">
	import {
		DefaultKeyboardShortcutsDialog,
		DefaultKeyboardShortcutsDialogContent,
		getTools,
		SvelteDrawUiMenuItem,
		type TLUiDialogProps,
	} from 'svelte-draw'

	const { onClose }: TLUiDialogProps = $props()

	const tools = getTools()
	const lassoTool = $derived(tools.current['lasso-select'])
</script>

<DefaultKeyboardShortcutsDialog {onClose}>
	<DefaultKeyboardShortcutsDialogContent />
	<SvelteDrawUiMenuItem {...lassoTool} />
</DefaultKeyboardShortcutsDialog>
