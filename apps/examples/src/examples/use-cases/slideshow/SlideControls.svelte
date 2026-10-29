<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { markHandledOnPointerDown } from './markHandledOnPointerDown'
	import { getSlides } from './SlidesManager'

	const slides = getSlides()
	const editor = getEditor()
	const markHandled = markHandledOnPointerDown(editor)
</script>

<button
	{@attach markHandled}
	style:pointer-events="all"
	style:position="absolute"
	style:top="50%"
	style:left="0"
	style:width="50px"
	style:height="50px"
	onclick={() => slides.prevSlide()}
>
	&lt;
</button>
<button
	{@attach markHandled}
	style:pointer-events="all"
	style:position="absolute"
	style:top="50%"
	style:right="0"
	style:width="50px"
	style:height="50px"
	onclick={() => slides.nextSlide()}
>
	&gt;
</button>
