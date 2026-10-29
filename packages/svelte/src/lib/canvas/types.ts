import type { Snippet } from 'svelte'
import type { Component } from 'svelte'
import type { TLEditorComponents } from '../context/components'

/** @public */
export interface TLErrorBoundaryProps {
	children: Snippet
	onError?: ((error: unknown) => void) | null
	fallback: Component<{ error: any }>
}

/** `TLEditorComponents` after defaults are applied (everything but `ErrorFallback`, which the root provides). */
export type ResolvedEditorComponents = Required<Omit<TLEditorComponents, 'ErrorFallback'>> &
	Pick<TLEditorComponents, 'ErrorFallback'>
