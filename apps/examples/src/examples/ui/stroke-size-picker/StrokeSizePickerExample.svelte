<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './stroke-size-picker.css'
	import CustomStylePanel from './CustomStylePanel.svelte'
	import { shapeUtils } from './strokeSize'

	const components: TLComponents = {
		StylePanel: CustomStylePanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{shapeUtils}
		{components}
		onMount={(editor) => {
			editor.setCurrentTool('draw')
		}}
	/>
</div>

<!--
This example replaces the draw tool's four stroke sizes (s, m, l, xl) with a
custom numeric stroke size style, controlled from the style panel by a
twelve-option preset picker.

[1]
We define a numeric style prop for the stroke size (strokeSize.ts). Because it's a style
(rather than a plain shape prop), the editor remembers the most recent value
for the next shape you draw, shows it in the style panel whenever it's
relevant, and reports a "mixed" value when a multi-shape selection disagrees.

[2]
We extend the draw shape's props interface via declaration merging, so
`shape.props.strokeSize` is fully typed everywhere.

[3]
We customize the default draw shape in two steps. `DrawShapeUtil.configure`
overrides `getCustomDisplayValues`, which the draw shape resolves its stroke
width through, so rendering, hit testing, and image exports all use our
custom size. The subclass then adds the style to the shape's props and
default props, which registers it with the editor's styles system and the
store's validator. Passing the util to `SvelteDraw` via the `shapeUtils` prop
replaces the built-in draw shape util, so the default draw tool picks it up
automatically.

[4]
The picker reads the current value from `getStylePanelContext()` (StrokeSizePicker.svelte). Its
`onValueChange` helper applies the style to any selected shapes and remembers
it for the next shapes, exactly like the built-in pickers.

[5]
The style map only contains the stroke size style when it's relevant: when
the draw tool is active, or when the selection includes draw shapes.
Everywhere else (geo shapes, arrows, text, and so on) we fall back to the
default four-value size picker, since those shapes still use the built-in
size style.

[6]
We compose the style panel (CustomStylePanel.svelte) from the same building blocks as the default
panel, swapping the size picker slot for our stroke size picker. See
`DefaultStylePanelContent` for the full list of available sections. Make sure
to forward the panel's props to `DefaultStylePanel`: the editor passes
`isMobile` when it renders the panel inside the mobile toolbar popover.
-->
