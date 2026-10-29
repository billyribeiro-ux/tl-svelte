import { EASINGS, atom, type Editor } from 'svelte-draw'
import type { SlideShape } from './SlideShapeUtil'

export const currentSlideAtom = atom<SlideShape | null>('current slide', null)

export function moveToSlide(editor: Editor, slide: SlideShape) {
	const bounds = editor.getShapePageBounds(slide.id)
	if (!bounds) return
	currentSlideAtom.set(slide)
	editor.selectNone()
	editor.zoomToBounds(bounds, {
		inset: 0,
		animation: { duration: 500, easing: EASINGS.easeInOutCubic },
	})
}

export function getSlides(editor: Editor) {
	return editor
		.getSortedChildIdsForParent(editor.getCurrentPageId())
		.map((id) => editor.getShape(id))
		.filter((s) => s?.type === 'slide') as SlideShape[]
}
