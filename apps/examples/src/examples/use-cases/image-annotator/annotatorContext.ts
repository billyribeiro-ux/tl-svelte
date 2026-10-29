import { createContext } from 'svelte'
import type { TLShapeId } from 'svelte-draw'

export interface AnnotatorContext {
	imageShapeId: TLShapeId
	onDone(result: Blob): void
}

// The overlay and done button are mounted by the editor without props, so they read what they
// need from the `ImageAnnotationEditor` that renders the editor.
export const [getAnnotator, setAnnotator] = createContext<AnnotatorContext>()
