<script lang="ts">
	import { EditorProvider, SvelteDraw, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './inspector-panel.css'
	import InspectorPanelWrapper from './InspectorPanelWrapper.svelte'

	// There's a guide at the bottom of this file!

	// [5]
	let editor = $state.raw<Editor | null>(null)
</script>

<div class="example-container">
	<div class="canvas-container">
		<SvelteDraw
			persistenceKey="inspector-panel-example"
			onMount={(mounted) => {
				editor = mounted
			}}
		/>
	</div>
	{#if editor}
		{#key editor}
			<EditorProvider {editor}>
				<InspectorPanelWrapper />
			</EditorProvider>
		{/key}
	{/if}
</div>

<!--
[1]
Everything the panel shows is read inside `fromComputed`, so the panel updates whenever
the selection or the selected shapes' records change. `getSharedStyles()` and
`getBindingsInvolvingShape()` are the same APIs the style panel and arrow bindings use.

[2]
`getSharedStyles()` returns a map from `StyleProp` to a `SharedStyle`: either
`{ type: 'shared', value }` when every selected shape agrees, or `{ type: 'mixed' }`.

[3]
Bindings are directional records with `fromId` and `toId`. For an arrow bound to a
shape, the arrow is `from` and the shape is `to`.

[4]
Components rendered outside `<SvelteDraw>` don't inherit its theme class, so we apply
`tl-theme__dark` / `tl-theme__light` ourselves based on the editor's color mode
(`createColorMode(editor)`).

[5]
The panel lives outside `<SvelteDraw>`, so it can't call `getEditor()` on its own. We grab
the editor from `onMount` and wrap the panel in `EditorProvider` to make `getEditor()`
work there.
-->
