<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setupNativeClipboardEvents } from './hooks/useClipboardEvents.svelte'
	import { setupKeyboardShortcuts } from './hooks/useKeyboardShortcuts.svelte'
	import SvelteDrawUiContent from './SvelteDrawUiContent.svelte'

	let {
		hideUi,
		children,
	}: { hideUi?: boolean; renderDebugMenuItems?: Snippet; children?: Snippet } = $props()

	// The hideUi prop should prevent the UI from mounting.
	// If we ever need want the UI to mount and preserve state, then
	// we should change this behavior and hide the UI via CSS instead.

	// Keyboard shortcuts and clipboard events should always be mounted,
	// even when the UI is hidden.
	setupKeyboardShortcuts()
	setupNativeClipboardEvents()
</script>

{@render children?.()}
{#if !hideUi}
	<SvelteDrawUiContent />
{/if}
