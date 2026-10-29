<!-- TEST HARNESS: renders SvelteDrawEditor with a `children` snippet. -->
<script lang="ts">
	import SvelteDrawEditor from '../SvelteDrawEditor.svelte'
	import type { SvelteDrawEditorProps } from '../types'

	let { editorProps }: { editorProps: SvelteDrawEditorProps } = $props()
</script>

<SvelteDrawEditor {...editorProps}>
	<div data-testid="custom-child"></div>
</SvelteDrawEditor>
