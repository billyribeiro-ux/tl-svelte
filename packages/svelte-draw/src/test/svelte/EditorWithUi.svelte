<script lang="ts">
	/** A `SvelteDrawEditor` composed by hand with `SvelteDrawUi` as its child. Tests only. */
	import { SvelteDrawEditor, type SvelteDrawEditorProps } from '@svelte-draw/svelte'
	import SvelteDrawUi from '../../lib/ui/SvelteDrawUi.svelte'
	import type { SvelteDrawUiProps } from '../../lib/ui/SvelteDrawUi.svelte'

	let { editorProps, uiProps }: { editorProps: SvelteDrawEditorProps; uiProps: SvelteDrawUiProps } =
		$props()
</script>

<SvelteDrawEditor {...editorProps}>
	<SvelteDrawUi {...uiProps} />
</SvelteDrawEditor>
