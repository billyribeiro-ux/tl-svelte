<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'
	import CustomStylePanel from './CustomStylePanel.svelte'

	const components: TLComponents = {
		StylePanel: CustomStylePanel,
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
This example adds a "Bold all text" toggle to the style panel that applies to
every selected shape with rich text at once. Rich text in svelte-draw is a TipTap
(ProseMirror) JSON document; each text node can carry a `marks` array such as
`[{ type: 'bold' }]`. Here we walk that JSON directly (see richTextBold.ts). For a version
that uses ProseMirror's Node API instead, see the "Text mass style updates" example.

[1]
The helpers in richTextBold.ts recursively map over the document, adding or removing the bold mark
on text nodes and leaving the structure untouched. `isAllTextBold` is the
inverse check that decides whether the button should add or remove bold.

[2]
`ExtractShapeByProps<{ richText: TLRichText }>` narrows to any shape whose props
include rich text (text, geo, note, arrow), so the panel works across shape
types. Reading the selection inside `fromComputed` keeps the button state in sync
as the selection or the shapes' text changes.

[3]
`editor.updateShapes` applies all the changes in one go, and the history stopping
point makes the whole toggle a single undo step. Shapes are never mutated
directly; we always pass a new `richText` object through the editor.
-->
