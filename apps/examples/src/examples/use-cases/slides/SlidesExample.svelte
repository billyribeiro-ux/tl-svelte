<script lang="ts">
	import { SvelteDraw, computed, type TLComponents, type TLUiOverrides } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { SlideShapeTool } from './SlideShapeTool'
	import { SlideShapeUtil } from './SlideShapeUtil'
	import SlidesKeyboardShortcutsDialog from './SlidesKeyboardShortcutsDialog.svelte'
	import SlidesPanel from './SlidesPanel.svelte'
	import SlidesToolbar from './SlidesToolbar.svelte'
	import './slides.css'
	import { currentSlideAtom, getSlides, moveToSlide } from './slides'

	// [1]
	const components: TLComponents = {
		HelperButtons: SlidesPanel,
		Minimap: null,
		Toolbar: SlidesToolbar,
		KeyboardShortcutsDialog: SlidesKeyboardShortcutsDialog,
	}

	// [2]
	const overrides: TLUiOverrides = {
		actions(editor, actions) {
			const slidesComputed = computed('slides', () => getSlides(editor))
			return {
				...actions,
				'next-slide': {
					id: 'next-slide',
					label: 'Next slide',
					kbd: 'right',
					onSelect() {
						const slides = slidesComputed.get()
						const currentSlide = currentSlideAtom.get()
						const index = slides.findIndex((s) => s.id === currentSlide?.id)
						const nextSlide = slides[index + 1] ?? currentSlide ?? slides[0]
						if (nextSlide) {
							editor.stopCameraAnimation()
							moveToSlide(editor, nextSlide)
						}
					},
				},
				'previous-slide': {
					id: 'previous-slide',
					label: 'Previous slide',
					kbd: 'left',
					onSelect() {
						const slides = slidesComputed.get()
						const currentSlide = currentSlideAtom.get()
						const index = slides.findIndex((s) => s.id === currentSlide?.id)
						const previousSlide = slides[index - 1] ?? currentSlide ?? slides[slides.length - 1]
						if (previousSlide) {
							editor.stopCameraAnimation()
							moveToSlide(editor, previousSlide)
						}
					},
				},
			}
		},
		tools(editor, tools) {
			tools.slide = {
				id: 'slide',
				icon: 'group',
				label: 'Slide',
				kbd: 's',
				onSelect: () => editor.setCurrentTool('slide'),
			}
			return tools
		},
	}

	const shapeUtils = [SlideShapeUtil]
	const tools = [SlideShapeTool]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="slideshow_example"
		{shapeUtils}
		{tools}
		{components}
		{overrides}
		onMount={(editor) => {
			if (getSlides(editor).length === 0) {
				editor.createShapes([
					{ type: 'slide', x: 100, y: 100, props: { w: 720, h: 480 } },
					{ type: 'slide', x: 900, y: 100, props: { w: 720, h: 480 } },
				])
			}
		}}
	/>
</div>

<!--
[1]
The slide list lives in the `HelperButtons` slot (top left, under the menu panel). The toolbar
and keyboard shortcuts dialog are replaced with versions that include the slide tool, since
new tools are not added to them automatically.

[2]
Two UI actions bound to the arrow keys move the camera between slides in page order.
`getSlides` is wrapped in a `computed` so the sorted list is only recomputed when shapes
change, not on every keypress.
-->
