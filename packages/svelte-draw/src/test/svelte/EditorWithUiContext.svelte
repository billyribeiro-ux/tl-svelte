<script lang="ts">
	/**
	 * A `SvelteDrawEditor` whose canvas sits inside the UI context (breakpoint, translations).
	 * Stands in for what setupVitest.js did for the React suite by mocking `useBreakpoint` and
	 * `useTranslation` globally: some shapes (frame labels) read them. Tests only.
	 */
	import { DefaultCanvas, SvelteDrawEditor, type SvelteDrawEditorProps } from '@svelte-draw/svelte'
	import SvelteDrawUiContextProvider from '../../lib/ui/context/SvelteDrawUiContextProvider.svelte'

	let { editorProps }: { editorProps: SvelteDrawEditorProps } = $props()
</script>

<SvelteDrawEditor {...editorProps}>
	<SvelteDrawUiContextProvider>
		<DefaultCanvas />
	</SvelteDrawUiContextProvider>
</SvelteDrawEditor>
