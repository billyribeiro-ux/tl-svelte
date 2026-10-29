<script lang="ts">
	import DefaultKeyboardShortcutsDialogContent from '../../../lib/ui/components/KeyboardShortcutsDialog/DefaultKeyboardShortcutsDialogContent.svelte'
	import SvelteDrawUiMenuContextProvider from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import ShortcutCapturer, { type ShortcutEntry } from './ShortcutCapturer.svelte'

	let { onCapture }: { onCapture(entries: ShortcutEntry[]): void } = $props()
</script>

<ShortcutCapturer {onCapture} />
<SvelteDrawUiMenuContextProvider type="keyboard-shortcuts" sourceId="kbd">
	<DefaultKeyboardShortcutsDialogContent />
</SvelteDrawUiMenuContextProvider>
