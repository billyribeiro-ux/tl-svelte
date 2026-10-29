import type { TLShape, VecModel } from '@svelte-draw/editor'
import type { Component, Snippet } from 'svelte'

/** @public */
export interface TLCanvasComponentProps {
	class?: string
}

/** @public */
export interface TLCursorProps {
	userId: string
	class?: string
	point: VecModel | null
	zoom: number
	color?: string
	name: string | null
	chatMessage: string
}

/** @public */
export interface TLGridProps {
	x: number
	y: number
	z: number
	size: number
}

/** @public */
export interface TLSpinnerProps {
	class?: string
}

/**
 * Props for the element that wraps each shape (and each shape background) on the canvas. The
 * canvas positions the element by writing to `ref.style`, so the wrapper must render a single
 * element and bind it to `ref`.
 *
 * @public
 */
export interface TLShapeWrapperProps {
	shape: TLShape
	isBackground: boolean
	/** The wrapper's root element. Bind with `bind:ref`. */
	ref?: HTMLDivElement | null
	children: Snippet
	class?: string
}

/** @public */
export interface TLErrorFallbackProps {
	error: unknown
	editor?: import('@svelte-draw/editor').Editor
}

/** @public */
export interface TLShapeErrorFallbackProps {
	error: unknown
}

/** @public */
export interface TLEditorComponents {
	Background?: Component | null
	Canvas?: Component<TLCanvasComponentProps> | null
	CollaboratorCursor?: Component<TLCursorProps> | null
	Grid?: Component<TLGridProps> | null
	InFrontOfTheCanvas?: Component | null
	LoadingScreen?: Component | null
	OnTheCanvas?: Component | null
	ShapeWrapper?: Component<TLShapeWrapperProps, Record<string, never>, 'ref'> | null
	Spinner?: Component<TLSpinnerProps> | null
	SvgDefs?: Component | null

	// These always have defaults
	ErrorFallback?: Component<TLErrorFallbackProps> | null
	ShapeErrorFallback?: Component<TLShapeErrorFallbackProps> | null
}
