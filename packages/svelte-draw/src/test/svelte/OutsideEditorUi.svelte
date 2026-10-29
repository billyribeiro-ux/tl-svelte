<script lang="ts">
	/**
	 * Default UI mounted beside `<SvelteDraw />` rather than inside it, wrapped in the providers a
	 * caller recreates (container, editor, ui context). The license provider is not among them.
	 * Tests only.
	 */
	import type { Editor } from '@svelte-draw/editor'
	import { EditorProvider, setContainer } from '@svelte-draw/svelte'
	import DefaultToolbar from '../../lib/ui/components/Toolbar/DefaultToolbar.svelte'
	import SvelteDrawUiContextProvider from '../../lib/ui/context/SvelteDrawUiContextProvider.svelte'
	import { createCommentingEnabled } from '../../lib/ui/hooks/useCommentingEnabled.svelte'
	import HookProbe from './HookProbe.svelte'

	let {
		editor,
		container,
		sink,
	}: { editor: Editor; container: HTMLElement; sink: { read?(): unknown } } = $props()

	// svelte-ignore state_referenced_locally
	setContainer(container)
</script>

<EditorProvider {editor}>
	<SvelteDrawUiContextProvider>
		<DefaultToolbar />
		<HookProbe use={createCommentingEnabled} {sink} />
	</SvelteDrawUiContextProvider>
</EditorProvider>
