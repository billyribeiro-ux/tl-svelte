<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import { markHandledOnPointerDown } from './markHandledOnPointerDown'
	import { SLIDE_MARGIN, SLIDE_SIZE, getSlides } from './SlidesManager'

	const editor = getEditor()
	const slides = getSlides()
	const currentSlides = fromComputed('slides', () => slides.getCurrentSlides())
	const lowestIndex = $derived(currentSlides.current[0].index)
	const highestIndex = $derived(currentSlides.current[currentSlides.current.length - 1].index)
	const markHandled = markHandledOnPointerDown(editor)
</script>

<!-- [4] -->
{#each currentSlides.current.slice(0, -1) as slide (slide.id + 'between')}
	<button
		{@attach markHandled}
		style:position="absolute"
		style:top="{SLIDE_SIZE.h / 2}px"
		style:left="{(slide.index + 1) * (SLIDE_SIZE.w + SLIDE_MARGIN) - (SLIDE_MARGIN + 40) / 2}px"
		style:width="40px"
		style:height="40px"
		style:pointer-events="all"
		onclick={() => {
			const newSlide = slides.newSlide(slide.index + 1)
			slides.setCurrentSlide(newSlide.id)
		}}
	>
		|
	</button>
{/each}
<button
	{@attach markHandled}
	style:position="absolute"
	style:top="{SLIDE_SIZE.h / 2}px"
	style:left="{lowestIndex * (SLIDE_SIZE.w + SLIDE_MARGIN) - (40 + SLIDE_MARGIN * 0.1)}px"
	style:width="40px"
	style:height="40px"
	style:pointer-events="all"
	onclick={() => {
		const slide = slides.newSlide(lowestIndex - 1)
		slides.setCurrentSlide(slide.id)
	}}
>
	+
</button>
<button
	{@attach markHandled}
	style:position="absolute"
	style:top="{SLIDE_SIZE.h / 2}px"
	style:left="{highestIndex * (SLIDE_SIZE.w + SLIDE_MARGIN) + (SLIDE_SIZE.w + SLIDE_MARGIN * 0.1)}px"
	style:width="40px"
	style:height="40px"
	style:pointer-events="all"
	onclick={() => {
		const slide = slides.newSlide(highestIndex + 1)
		slides.setCurrentSlide(slide.id)
	}}
>
	+
</button>

<!--
[4]
The buttons for inserting slides are rendered in `OnTheCanvas`, so they are positioned in
page space between the frames. `markEventAsHandled` on pointer down stops the canvas from
treating the press as the start of a drag.
-->
