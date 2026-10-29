<script lang="ts">
	import {
		SvelteDrawUiButton,
		fromComputed,
		fromSignal,
		getEditor,
	} from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import { on } from 'svelte/events'
	import { currentSlideAtom, getSlides, moveToSlide } from './slides'

	const editor = getEditor()
	const slides = fromComputed('slide shapes', () => getSlides(editor))
	const currentSlide = fromSignal(currentSlideAtom)
	const selectedShapes = fromComputed('selected shapes', () => editor.getSelectedShapes())

	// Svelte delegates `onpointerdown`, which runs after the editor container's native listener, so
	// marking the event as handled has to happen on the element itself.
	const markHandled: Attachment<HTMLElement> = (element) =>
		on(element, 'pointerdown', (e) => editor.markEventAsHandled(e))
</script>

{#if slides.current.length > 0}
	<div class="slides-panel scroll-light" {@attach markHandled}>
		{#each slides.current as slide, i (slide.id)}
			{@const isSelected = selectedShapes.current.includes(slide)}
			<SvelteDrawUiButton
				type="normal"
				class="slides-panel-button"
				onclick={() => moveToSlide(editor, slide)}
				style="background: {currentSlide.current?.id === slide.id
					? 'var(--tl-color-background)'
					: 'transparent'}; outline: {isSelected
					? 'var(--tl-color-selection-stroke) solid 1.5px'
					: 'none'};"
			>
				{`Slide ${i + 1}`}
			</SvelteDrawUiButton>
		{/each}
	</div>
{/if}
