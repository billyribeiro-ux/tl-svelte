<script lang="ts">
	import {
		DefaultKeyboardShortcutsDialog,
		DefaultKeyboardShortcutsDialogContent,
		getTools,
		SvelteDrawUiMenuItem,
		type TLUiDialogProps,
	} from 'svelte-draw'

	let { onClose }: TLUiDialogProps = $props()

	// [3]
	const tools = getTools()
	const sticker = $derived(tools.current['sticker'])
</script>

<DefaultKeyboardShortcutsDialog {onClose}>
	<DefaultKeyboardShortcutsDialogContent />
	<!-- Ideally, we'd interleave this into the tools group -->
	<SvelteDrawUiMenuItem {...sticker} />
</DefaultKeyboardShortcutsDialog>
