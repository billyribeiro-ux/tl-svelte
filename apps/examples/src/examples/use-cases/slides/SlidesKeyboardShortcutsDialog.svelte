<script lang="ts">
	import {
		DefaultKeyboardShortcutsDialog,
		DefaultKeyboardShortcutsDialogContent,
		SvelteDrawUiMenuItem,
		getTools,
	} from 'svelte-draw'

	let { onClose }: { onClose(): void } = $props()

	const tools = getTools()
</script>

<DefaultKeyboardShortcutsDialog {onClose}>
	<SvelteDrawUiMenuItem {...tools.current['slide']} />
	<DefaultKeyboardShortcutsDialogContent />
</DefaultKeyboardShortcutsDialog>
