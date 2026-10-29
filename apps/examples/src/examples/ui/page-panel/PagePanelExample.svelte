<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'

	// [1]
	const components: TLComponents = {
		PageMenu: null,
	}
</script>

<script lang="ts">
	import { EditorProvider, SvelteDraw, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './page-panel.css'
	import PagePanel from './PagePanel.svelte'

	// There's a guide at the bottom of this file!

	let editor = $state.raw<Editor | null>(null)
</script>

<div class="page-panel-layout">
	<!-- [2] -->
	{#if editor}
		{#key editor}
			<EditorProvider {editor}>
				<PagePanel />
			</EditorProvider>
		{/key}
	{/if}
	<div class="page-panel-canvas">
		<SvelteDraw
			persistenceKey="page-panel-example"
			{components}
			onMount={(mounted) => {
				editor = mounted
			}}
		/>
	</div>
</div>

<!--
This example shows how to replace the built-in page menu with a custom page
panel in your own DOM, outside the canvas, with live thumbnail previews of
every page.

The canvas only renders the shapes of the current page, so we export the
other pages as images to show their previews.

[1]
Hide the built-in page menu by overriding the `PageMenu` component with null.

[2]
Use the `onMount` prop to grab the editor instance and store it in state.
Wrapping external components in `EditorProvider` lets them use `getEditor()` and
`fromComputed` even though they're rendered outside `<SvelteDraw />`.
-->
