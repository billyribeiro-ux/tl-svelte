<script lang="ts">
	import {
		SvelteDraw,
		createShapeId,
		fromComputed,
		type Editor,
		type TLComponents,
		type TLFrameShape,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import SlideControls from './SlideControls.svelte'
	import Slides from './Slides.svelte'
	import { SLIDE_MARGIN, SLIDE_SIZE, SlidesManager, setSlides } from './SlidesManager'

	const slides = new SlidesManager()
	setSlides(slides)

	let editor = $state.raw<Editor | null>(null)

	const currentSlide = fromComputed('currentSlide', () => slides.getCurrentSlide())

	// [1]
	$effect(() => {
		if (!editor) return
		const slide = currentSlide.current

		const nextBounds = {
			x: slide.index * (SLIDE_SIZE.w + SLIDE_MARGIN),
			y: 0,
			w: SLIDE_SIZE.w,
			h: SLIDE_SIZE.h,
		}

		editor.setCameraOptions({
			constraints: {
				bounds: nextBounds,
				behavior: 'contain',
				initialZoom: 'fit-max',
				baseZoom: 'fit-max',
				origin: { x: 0.5, y: 0.5 },
				padding: { x: 50, y: 50 },
			},
		})

		editor.zoomToBounds(nextBounds, { force: true, animation: { duration: 500 } })
	})

	const currentSlides = fromComputed('slides', () => slides.getCurrentSlides())

	// [2]
	$effect(() => {
		const editor_ = editor
		if (!editor_) return
		const slideList = currentSlides.current

		const ids = slideList.map((slide) => createShapeId(slide.id))

		editor_.run(() => {
			for (let i = 0; i < slideList.length; i++) {
				const shapeId = ids[i]
				const slide = slideList[i]
				const shape = editor_.getShape(shapeId)
				if (shape) {
					if (shape.x === slide.index * (SLIDE_SIZE.w + SLIDE_MARGIN)) continue

					// Renumber the frame unless the user has renamed it
					let name = (shape as TLFrameShape).props.name
					if (/Slide \d+/.test(name)) {
						name = `Slide ${slide.index + 1}`
					}

					editor_.updateShape({
						id: shapeId,
						type: 'frame',
						x: slide.index * (SLIDE_SIZE.w + SLIDE_MARGIN),
						props: {
							name,
						},
					})
				} else {
					editor_.createShape({
						id: shapeId,
						parentId: editor_.getCurrentPageId(),
						type: 'frame',
						x: slide.index * (SLIDE_SIZE.w + SLIDE_MARGIN),
						y: 0,
						props: {
							name: `Slide ${slide.index + 1}`,
							w: SLIDE_SIZE.w,
							h: SLIDE_SIZE.h,
						},
					})
				}
			}
		})

		// [3]
		const unsubs: (() => void)[] = []

		unsubs.push(
			editor_.sideEffects.registerBeforeChangeHandler('shape', (prev, next) => {
				if (
					ids.includes(next.id) &&
					(next as TLFrameShape).props.name === (prev as TLFrameShape).props.name
				)
					return prev
				return next
			})
		)

		unsubs.push(
			editor_.sideEffects.registerBeforeChangeHandler('instance_page_state', (prev, next) => {
				next.selectedShapeIds = next.selectedShapeIds.filter((id) => !ids.includes(id))
				if (next.hoveredShapeId && ids.includes(next.hoveredShapeId)) next.hoveredShapeId = null
				return next
			})
		)

		return () => {
			unsubs.forEach((fn) => fn())
		}
	})

	const components: TLComponents = {
		OnTheCanvas: Slides,
		InFrontOfTheCanvas: SlideControls,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={(mounted) => {
			editor = mounted
		}} {components} />
</div>

<!--
[1]
Whenever the current slide changes, the camera constraints are re-pointed at that slide's
bounds with `contain` behavior and `fit-max` zoom, so the user can't pan or zoom away from
it, then the camera is animated there. `force: true` is needed because the constraints
would otherwise block the move.

[2]
The slide list is app state (see SlidesManager.ts); each slide is mirrored on the canvas as
a frame shape whose id is derived from the slide id with `createShapeId(slide.id)`. When
slides are inserted, existing frames are shifted and renumbered.

[3]
Two before-change side effects keep the frames in place: any change to a slide frame other
than renaming it is rejected, and slide frames are removed from the selection and hover
state so they can't be picked up by the select tool.
-->

<!--
[4]
See Slides.svelte: the buttons for inserting slides are rendered in `OnTheCanvas`, so they are
positioned in page space between the frames.
-->
