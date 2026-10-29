import type { Editor } from '../editor/Editor'
import type { ShapeView, ViewComponent } from '../editor/shapes/ShapeView'
import type { SvgExportContext } from '../editor/types/SvgExportContext'
import type { Box } from '../primitives/Box'

/**
 * One shape layer of an SVG export whose shape provides its own `toSvg` / `toBackgroundSvg`
 * output. The renderer wraps `view` in a `<g>` with the given attributes.
 *
 * @public
 */
export interface SvgExportSvgLayer {
	readonly kind: 'svg'
	readonly key: string
	readonly zIndex: number
	readonly transform: string
	readonly opacity: number
	/** A CSS `url(#id)` reference into the export defs, if the shape is masked by a frame. */
	readonly clipPath: string | undefined
	readonly view: ShapeView
}

/**
 * One shape layer of an SVG export whose shape has no custom SVG output: its normal HTML view is
 * rendered inside a `<foreignObject class="tl-shape-foreign-object tl-export-embed-styles">`
 * covering `bounds`, wrapped in a `<div class={className} data-shape-type={shapeType}>` styled with
 * `style`. A view that throws while rendering must be omitted rather than failing the export.
 *
 * @public
 */
export interface SvgExportForeignObjectLayer {
	readonly kind: 'foreignObject'
	readonly key: string
	readonly zIndex: number
	readonly shapeType: string
	readonly className: string
	readonly bounds: { x: number; y: number; width: number; height: number }
	readonly style: {
		readonly clipPath: string | undefined
		readonly transform: string
		readonly width: number
		readonly height: number
		readonly opacity: number
	}
	readonly view: ShapeView | null
}

/** @public */
export type SvgExportLayer = SvgExportSvgLayer | SvgExportForeignObjectLayer

/**
 * Content for the export's `<defs>`. `clipPath` is `<clipPath id={id}><path d={d} /></clipPath>`
 * and `style` is `<style nonce={nonce}>{css}</style>`.
 *
 * @public
 */
export type SvgExportDefContent =
	| { readonly type: 'view'; readonly view: ShapeView }
	| { readonly type: 'clipPath'; readonly id: string; readonly d: string }
	| { readonly type: 'style'; readonly css: string; readonly nonce: string | undefined }

/** @public */
export interface SvgExportDefEntry {
	readonly key: string
	/** `null` when the def resolved to nothing. */
	readonly content: SvgExportDefContent | null
}

/**
 * The part of an export that changes while the export is being prepared. A new object is produced
 * on every change; `layers` is `null` until the shapes have been prepared.
 *
 * @public
 */
export interface SvgExportSceneState {
	readonly layers: readonly SvgExportLayer[] | null
	/** Only resolved defs, in the order they were first added. */
	readonly defs: readonly SvgExportDefEntry[]
}

/**
 * A framework-neutral description of the SVG to render for an export. The renderer renders
 * `<svg>` with these attributes containing `<defs>` (state.defs) followed by state.layers in
 * order, inside `scene.exportProvider` if it's set, with the editor and container available to
 * the rendered components.
 *
 * @public
 */
export interface SvgExportScene {
	readonly editor: Editor
	readonly context: SvgExportContext
	readonly exportProvider: ViewComponent | null
	/** Outer size in CSS pixels, already multiplied by the export scale. */
	readonly width: number
	readonly height: number
	readonly viewBox: Box
	readonly preserveAspectRatio: string | undefined
	readonly backgroundColor: string
	readonly colorMode: 'light' | 'dark'
	/** Value for the root svg's `class`. */
	readonly className: string
	getState(): SvgExportSceneState
	/** Subscribe to state changes. Returns the unsubscribe function. */
	subscribe(listener: () => void): () => void
}

/** @public */
export interface SvgExportRenderHandle {
	/** Synchronously apply any pending state updates to the DOM. */
	flush(): void
	/** Tear the rendered tree down. */
	unmount(): void
}

/**
 * Renders an {@link SvgExportScene} into a real, laid-out DOM element, so that
 * `<foreignObject>` content gets its computed styles. `render` is called once per export; the
 * rendered `<svg>` must be the first element child of `target`. The editor core flushes, waits
 * for the export delay, serialises, then unmounts.
 *
 * @public
 */
export interface SvgExportRenderer {
	render(scene: SvgExportScene, target: HTMLElement): SvgExportRenderHandle
}

let registeredRenderer: SvgExportRenderer | null = null

/**
 * Register the renderer used for SVG exports when `editor.options.svgExportRenderer` is not set.
 *
 * @public
 */
export function registerSvgExportRenderer(renderer: SvgExportRenderer | null): void {
	registeredRenderer = renderer
}

/** @internal */
export function getSvgExportRenderer(editor: Editor): SvgExportRenderer {
	const renderer = editor.options.svgExportRenderer ?? registeredRenderer
	if (!renderer) {
		throw new Error(
			'No SVG export renderer is registered. Call registerSvgExportRenderer() (the Svelte package provides svelteSvgExportRenderer) or set the svgExportRenderer option.'
		)
	}
	return renderer
}
