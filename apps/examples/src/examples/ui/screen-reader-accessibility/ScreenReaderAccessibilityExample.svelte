<script lang="ts" module>
	import type { TLComponents, TLUiOverrides } from 'svelte-draw'
	import { CARD_SHAPE_TYPE, CardShapeUtil } from './CardShapeUtil'
	import CustomAnnouncementPanel from './CustomAnnouncementPanel.svelte'

	const customShapes = [CardShapeUtil]

	// [3]
	const overrides: TLUiOverrides = {
		translations: {
			en: { [`tool.${CARD_SHAPE_TYPE}`]: 'Note card' },
		},
	}

	const components: TLComponents = {
		TopPanel: CustomAnnouncementPanel,
	}
</script>

<script lang="ts">
	import { SvelteDraw, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './screen-reader-accessibility.css'

	function handleMount(editor: Editor) {
		// [8]
		editor.createShape({
			type: CARD_SHAPE_TYPE,
			x: 100,
			y: 100,
			props: {
				title: 'Meeting Notes',
				description: 'Discussed Q4 planning and team goals',
			},
		})

		editor.createShape({
			type: CARD_SHAPE_TYPE,
			x: 450,
			y: 100,
			props: {
				title: 'Project Ideas',
				description: 'Brainstorming session for new features',
			},
		})

		editor.createShape({
			type: CARD_SHAPE_TYPE,
			x: 100,
			y: 320,
			props: {
				title: 'Action Items',
				description: 'Follow up with design team by Friday',
			},
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShapes} {overrides} {components} onMount={handleMount} />
</div>

<!--
This example shows two sides of screen reader support: making a custom shape
describe itself when selected, and announcing your own messages from custom UI.

[1]
`getAriaDescriptor()` (CardShapeUtil.ts) returns the text announced when the shape is selected.
It's the place for an alt-text-style description that may differ from what's
visibly rendered. If it returns nothing, the announcer falls back to
`getText()`.

[2]
`getText()` returns the shape's visible text. The editor uses it for text
extraction and search, and the announcer uses it as the fallback described in
[1]. Returning it here also lets the "Validate selection" button
(CustomAnnouncementPanel.svelte) check whether the selected shapes have any text at all.

[3]
The selection announcement ends with the shape's type, looked up as
`tool.<type>` in the UI translations. Without an override a custom shape is
announced by its raw key ("tool.note-card"), so we add a translation for it.

[4]-[7] are in CustomAnnouncementPanel.svelte.

[8]
Create three sample cards. Select one to hear the `getAriaDescriptor()`
text, followed by the shape type and its index in reading order ("1 of 3").
The announcements render into an off-screen ARIA live region owned by the
default `A11y` component, so nothing visible changes.
-->
