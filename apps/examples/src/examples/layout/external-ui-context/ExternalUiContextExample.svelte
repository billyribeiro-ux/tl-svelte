<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './external-ui.css'
	import ExternalToolbar from './ExternalToolbar.svelte'
	import { setExternalEditor } from './editorContext'

	// There's a guide at the bottom of this file!

	let editor = $state.raw<Editor | null>(null)

	// [1]
	// The context is provided once, with a getter, so consumers always see the current editor.
	setExternalEditor(() => editor)
</script>

<div style="margin: 32px; width: 600px;">
	<div style="height: 400px;">
		<!-- [2] -->
		<SvelteDraw onMount={(e) => {
			editor = e
		}} components={{ Toolbar: null }} />
	</div>
	<!-- [3] -->
	{#if editor}
		<ExternalToolbar />
	{/if}
</div>

<!--
[1]
A Svelte context for the editor. Components outside `SvelteDraw` can't use `getEditor()`,
so we provide our own (see editorContext.ts).

[2]
Use the `onMount` prop to get the editor instance and store it in state.

[3]
Only render the consumer (and its descendants) once the editor exists, so consumers
never see a null editor. See ExternalToolbar.svelte for [4] and [5].
-->
