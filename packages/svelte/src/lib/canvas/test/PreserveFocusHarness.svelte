<script lang="ts">
	/**
	 * The editor harness plus the `svelteDraw_preserve_focus` effect the root `SvelteDrawEditor`
	 * runs: `preserveFocusOnPointerDown(editor, autoFocus)` from an `$effect`.
	 */
	import type { Editor, TLStore } from '@svelte-draw/editor'
	import { preserveFocusOnPointerDown } from '../preserveFocus'
	import EditorHarness from './EditorHarness.svelte'

	let { store, onMount }: { store: TLStore; onMount?: (editor: Editor) => void } = $props()

	let editor = $state.raw<Editor | null>(null)

	$effect(() => {
		if (!editor) return
		return preserveFocusOnPointerDown(editor, true)
	})
</script>

<EditorHarness
	{store}
	autoFocus
	onMount={(e: Editor) => {
		editor = e
		onMount?.(e)
	}}
/>
