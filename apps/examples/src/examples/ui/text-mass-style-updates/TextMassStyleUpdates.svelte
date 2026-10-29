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

	// There's a guide at the bottom of this file!
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="mass-style-updates-example" {components} />
</div>

<!--
This example adds bold, italic, and highlight buttons to the style panel that
toggle the mark on all text in the selected shapes at once, including text
shapes nested inside selected frames and groups. Rich text is a TipTap
(ProseMirror) JSON document; rather than walk the JSON by hand we parse it into
a ProseMirror `Node` and use its mark API. For a hand-rolled JSON version, see
the "Format rich text on multiple shapes" example.

[1] and [2] are in richTextMarks.ts:
`setMark` and `mapTextNodes` rebuild a ProseMirror document with each text
node's marks changed. ProseMirror nodes are immutable, so we return a new tree
rather than mutating in place. `setMarkOnShape` parses `shape.props.richText`
with `Node.fromJSON` and the default TipTap schema, and writes the result back
with `toJSON()`; the add/remove decision is made once per click.

[3]
The custom `StylePanel` (CustomStylePanel.svelte) wraps `DefaultStylePanel` and adds a
section above the default content. `getShapeAndDescendantIds` expands the selection to
include nested shapes so the buttons appear when a frame containing text is selected.

[4]
Each button (StyleButton.svelte) reads its active state inside `fromComputed`, so it stays
in sync as the selection or the shapes' text changes. Reactivity here comes from
`editor.getShape` being read inside the computation.
-->
