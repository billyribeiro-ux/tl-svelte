import { defaultEditorComponents } from '../canvas/componentsContext'
import type { ResolvedEditorComponents } from '../canvas/types'
import DefaultErrorFallback from './DefaultErrorFallback.svelte'

/**
 * The full default `TLEditorComponents` map: the canvas layer's defaults plus the root layer's
 * `DefaultErrorFallback`. Replaces the default object `EditorComponentsProvider` built.
 */
export function getDefaultEditorComponents(): ResolvedEditorComponents {
	return { ...defaultEditorComponents, ErrorFallback: DefaultErrorFallback }
}

export { DefaultErrorFallback }
