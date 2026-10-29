import { DefaultColorStyle, TLFontFace, TLShapeId } from '@svelte-draw/tlschema'
import { promiseWithResolve, uniqueId } from '@svelte-draw/utils'
import type { Editor, TLRenderingShape } from '../editor/Editor'
import { getColorValue } from '../editor/managers/ThemeManager/defaultThemes'
import type { ShapeView } from '../editor/shapes/ShapeView'
import { TLImageExportOptions } from '../editor/types/misc-types'
import type { SvgExportContext, SvgExportDef } from '../editor/types/SvgExportContext'
import { Box } from '../primitives/Box'
import { Mat } from '../primitives/Mat'
import { sanitizeId, suffixSafeId, type SafeId } from '../utils/safeId'
import { ExportDelay } from './ExportDelay'
import type {
	SvgExportDefContent,
	SvgExportDefEntry,
	SvgExportLayer,
	SvgExportScene,
	SvgExportSceneState,
} from './SvgExportRenderer'

let sceneCounter = 1

/** @internal */
export interface SvgExportSceneResult {
	scene: SvgExportScene
	/** Outer size in CSS pixels (already multiplied by the scale). */
	width: number
	height: number
	exportDelay: ExportDelay
	trimPadding: number
	/**
	 * Prepare the shape layers and font defs and publish them to the scene. Call once, after the
	 * scene has been handed to a renderer. Failures abort the export through `exportDelay`.
	 */
	populate(): Promise<void>
}

/** @internal */
export function getSvgScene(
	editor: Editor,
	ids: TLShapeId[],
	opts: TLImageExportOptions = {}
): SvgExportSceneResult | undefined {
	const editorDocument = editor.getContainerDocument()
	if (!editorDocument) throw Error('No document')

	const {
		scale = 1,
		// should we include the background in the export? or is it transparent?
		background = editor.getInstanceState().exportBackground,
		preserveAspectRatio,
	} = opts

	// Resolve the padding mode:
	// - 'auto' (or undefined): render with default padding, then trim to actual visual content
	// - number: fixed padding, no trimming
	const isAutoTrim = typeof opts.padding !== 'number'
	const renderPadding =
		typeof opts.padding === 'number' ? opts.padding : editor.options.defaultSvgPadding

	const colorMode: 'light' | 'dark' =
		opts.darkMode !== undefined ? (opts.darkMode ? 'dark' : 'light') : editor.getColorMode()
	const isDarkMode = colorMode === 'dark'

	// ---Figure out which shapes we need to include
	const shapeIdsToInclude = editor.getShapeAndDescendantIds(ids)
	const renderingShapes = editor
		.getUnorderedRenderingShapes(false)
		.filter(({ id }) => shapeIdsToInclude.has(id))

	// --- Common bounding box of all shapes
	const singleFrameShape = ids.length === 1 ? editor.getShape(ids[0]) : null
	const singleFrameShapeId =
		singleFrameShape && editor.isShapeFrameLike(singleFrameShape) ? ids[0] : null

	let bbox: null | Box = null
	let paddingWasApplied = false
	if (opts.bounds) {
		// Explicit bounds: use exact bounds when auto, expand by padding when fixed
		bbox = isAutoTrim ? opts.bounds.clone() : opts.bounds.clone().expandBy(renderPadding)
	} else {
		const result = getExportDefaultBounds(
			editor,
			renderingShapes,
			renderPadding,
			singleFrameShapeId
		)
		bbox = result.box
		paddingWasApplied = result.paddingApplied
	}

	// no unmasked shapes to export
	if (!bbox) return

	// When auto-trim is active and padding was applied by getExportDefaultBounds,
	// the padding region is trimmable: exports will scan pixels from each edge inward
	// and trim to the actual visual content bounds. This ensures visual overflow
	// (strokes, arrowheads) is captured without unnecessary whitespace.
	const trimPadding = isAutoTrim && paddingWasApplied ? renderPadding : 0

	// We want the svg image to be BIGGER THAN USUAL to account for image quality
	const w = bbox.width * scale
	const h = bbox.height * scale

	try {
		editorDocument.body.focus?.() // weird but necessary
	} catch {
		// not implemented
	}

	const exportDelay = new ExportDelay(editor.options.maxExportDelayMs)

	const initialEffectPromise = promiseWithResolve<void>()
	exportDelay.waitUntil(initialEffectPromise)

	const pixelRatio = opts.pixelRatio ?? null

	// --- state, as published to the renderer
	type DefState = { pending: true } | { pending: false; content: SvgExportDefContent | null }
	const defsByKey = new Map<string, DefState>()
	let layers: readonly SvgExportLayer[] | null = null
	let state: SvgExportSceneState = { layers: null, defs: [] }
	const listeners = new Set<() => void>()

	function publish() {
		const defs: SvgExportDefEntry[] = []
		for (const [key, def] of defsByKey) {
			if (!def.pending) defs.push({ key, content: def.content })
		}
		// Embedded font CSS is published after every other def, which is where the React export tree
		// put it, so exports stay byte-comparable. Array#sort is stable, so the rest keep their order.
		defs.sort((a, b) => Number(a.content?.type === 'style') - Number(b.content?.type === 'style'))
		state = { layers, defs }
		for (const listener of [...listeners]) listener()
	}

	const viewToContent = (view: ShapeView | null): SvgExportDefContent | null =>
		view ? { type: 'view', view } : null

	function addContentDef(key: string, content: Promise<SvgExportDefContent | null>) {
		if (defsByKey.has(key)) return
		defsByKey.set(key, { pending: true })
		exportDelay.waitUntil(
			content.then((result) => {
				defsByKey.set(key, { pending: false, content: result })
				publish()
			})
		)
	}

	function addExportDef(def: SvgExportDef) {
		addContentDef(
			def.key,
			Promise.resolve(def.getElement()).then((view) => viewToContent(view))
		)
	}

	const exportContext: SvgExportContext = {
		isDarkMode,
		colorMode,
		waitUntil: exportDelay.waitUntil,
		addExportDef,
		scale,
		pixelRatio,
		async resolveAssetUrl(assetId, width) {
			const asset = editor.getAsset(assetId)
			if (!asset || (asset.type !== 'image' && asset.type !== 'video')) return null

			return await editor.resolveAssetUrl(assetId, {
				screenScale: scale * (width / asset.props.w),
				shouldResolveToOriginal: pixelRatio === null,
				dpr: pixelRatio ?? undefined,
			})
		},
	}

	const theme = editor.getCurrentTheme()
	const colors = theme.colors[colorMode]
	let backgroundColor = background ? colors.background : 'transparent'

	if (singleFrameShapeId && background) {
		// the frame-like shape's own util decides this - it may not be the default 'frame' util
		const shape = editor.getShape(singleFrameShapeId)!
		const { showColors } = editor.getShapeUtil(shape).options as { showColors?: boolean }
		// the color style may live under any prop key, so look it up through the style map and
		// fall back to a literal `color` prop for frame-like shapes that don't use the style
		const color = showColors
			? (editor.getShapeStyleIfExists(shape, DefaultColorStyle) ??
				('color' in shape.props ? shape.props.color : null))
			: null
		backgroundColor =
			typeof color === 'string' ? getColorValue(colors, color, 'frameFill') : colors.solid
	}

	const scene: SvgExportScene = {
		editor,
		context: exportContext,
		exportProvider: editor.options.exportProvider,
		width: w,
		height: h,
		viewBox: bbox,
		preserveAspectRatio,
		backgroundColor,
		colorMode,
		className: `tl-container tl-theme__force-sRGB ${isDarkMode ? 'tl-theme__dark' : 'tl-theme__light'}`,
		getState: () => state,
		subscribe(listener) {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
	}

	const masksId = sanitizeId(`tl_export_masks_${sceneCounter++}_${uniqueId()}`) as SafeId
	const exportBounds = bbox

	async function buildLayers(): Promise<{
		layers: SvgExportLayer[]
		maskDefs: Record<string, SvgExportDefContent>
	}> {
		const maskDefs: Record<string, SvgExportDefContent> = {}

		// Render everything. The shapes with assets should all hit the cache
		const unordered = renderingShapes.map(async ({ id, opacity, index, backgroundIndex }) => {
			// Don't render the frame if we're only exporting a single frame and it's children
			if (id === singleFrameShapeId) return []

			const shape = editor.getShape(id)!

			if (editor.isShapeOfType(shape, 'group')) return []

			const result: SvgExportLayer[] = []
			const util = editor.getShapeUtil(shape)

			if (util.toSvg || util.toBackgroundSvg) {
				// If the shape has any sort of custom svg export, let's use that.
				const [toSvgResult, toBackgroundSvgResult] = await Promise.all([
					util.toSvg?.(shape, exportContext),
					util.toBackgroundSvg?.(shape, exportContext),
				])

				const pageTransform = editor.getShapePageTransform(shape)
				let pageTransformString = pageTransform!.toCssString()
				let shapeScale = 1
				if ('scale' in shape.props) {
					if (shape.props.scale !== 1) {
						shapeScale = shape.props.scale
						pageTransformString = `${pageTransformString} scale(${shape.props.scale}, ${shape.props.scale})`
					}
				}

				// Create svg mask if shape has a frame as parent
				const pageMask = editor.getShapeMask(shape.id)
				const shapeMask = pageMask
					? Mat.From(Mat.Inverse(pageTransform)).applyToPoints(pageMask)
					: null
				const shapeMaskId = suffixSafeId(masksId, shape.id)
				if (shapeMask) {
					// Create a clip path and add it to defs
					maskDefs[shapeMaskId] = {
						type: 'clipPath',
						id: shapeMaskId,
						// a polyline mask that does the clipping
						d: `M${shapeMask.map(({ x, y }) => `${x / shapeScale},${y / shapeScale}`).join('L')}Z`,
					}
				}
				const clipPath = pageMask ? `url(#${shapeMaskId})` : undefined

				if (toSvgResult) {
					result.push({
						kind: 'svg',
						key: `fg_${shape.id}`,
						zIndex: index,
						transform: pageTransformString,
						opacity,
						clipPath,
						view: toSvgResult,
					})
				}
				if (toBackgroundSvgResult) {
					result.push({
						kind: 'svg',
						key: `bg_${shape.id}`,
						zIndex: backgroundIndex,
						transform: pageTransformString,
						opacity,
						clipPath,
						view: toBackgroundSvgResult,
					})
				}
			} else {
				// If the shape doesn't have a custom svg export, we'll use its normal HTML
				// renderer in a foreignObject.
				result.push(
					getForeignObjectLayer(editor, exportBounds, {
						key: `fg_${shape.id}`,
						zIndex: index,
						shapeId: shape.id,
						className: 'tl-shape',
						opacity,
						getView: (latest) => util.component(latest as never),
					})
				)

				if (util.backgroundComponent) {
					result.push(
						getForeignObjectLayer(editor, exportBounds, {
							key: `bg_${shape.id}`,
							zIndex: backgroundIndex,
							shapeId: shape.id,
							className: 'tl-shape tl-shape-background',
							opacity,
							getView: (latest) => util.backgroundComponent?.(latest as never) ?? null,
						})
					)
				}
			}

			return result
		})

		return { layers: (await Promise.all(unordered)).flat(), maskDefs }
	}

	function addFontDefs() {
		const fontsInUse = new Set<TLFontFace>()
		for (const { id } of renderingShapes) {
			for (const font of editor.fonts.getShapeFontFaces(id)) {
				fontsInUse.add(font)
			}
		}

		for (const font of fontsInUse) {
			addContentDef(
				uniqueId(),
				editor.fonts
					.toEmbeddedCssDeclaration(font)
					.then((css) => ({ type: 'style', css, nonce: editor.options.nonce }))
			)
		}
	}

	async function populate() {
		// a throwing `toSvg` would otherwise leave the initial promise pending forever, so the
		// export would wait out its max delay and snapshot an empty svg
		try {
			addFontDefs()
			const built = await buildLayers()
			for (const [key, content] of Object.entries(built.maskDefs)) {
				defsByKey.set(key, { pending: false, content })
			}
			layers = built.layers.sort((a, b) => a.zIndex - b.zIndex)
			publish()
			initialEffectPromise.resolve()
		} catch (error) {
			exportDelay.fail(error)
		}
	}

	return { scene, width: w, height: h, exportDelay, trimPadding, populate }
}

function getForeignObjectLayer(
	editor: Editor,
	bbox: Box,
	opts: {
		key: string
		zIndex: number
		shapeId: TLShapeId
		className: string
		opacity: number
		getView(shape: NonNullable<ReturnType<Editor['getShape']>>): ShapeView | null
	}
): SvgExportLayer {
	const shape = editor.getShape(opts.shapeId)!
	const transform = Mat.Translate(-bbox.minX, -bbox.minY).multiply(
		editor.getShapePageTransform(shape.id)!
	)

	const bounds = editor.getShapeGeometry(shape.id).bounds

	// A view that throws is dropped, matching the old error boundary with a null fallback.
	let view: ShapeView | null = null
	try {
		view = opts.getView(shape)
	} catch (error) {
		console.warn(`[svelte-draw] Shape "${shape.type}" failed to render for export`, error)
	}

	return {
		kind: 'foreignObject',
		key: opts.key,
		zIndex: opts.zIndex,
		shapeType: shape.type,
		className: opts.className,
		bounds: { x: bbox.minX, y: bbox.minY, width: bbox.w, height: bbox.h },
		style: {
			clipPath: editor.getShapeClipPath(shape.id),
			transform: transform.toCssString(),
			width: Math.max(bounds.width, 1),
			height: Math.max(bounds.height, 1),
			opacity: opts.opacity,
		},
		view,
	}
}

/**
 * Calculates the default bounds for an SVG export. This function handles:
 * 1. Computing masked page bounds for each shape
 * 2. Container logic: if a shape is marked as an export bounds container and it
 *    contains all other shapes, use its bounds and skip padding
 * 3. Otherwise, create a union of all shape bounds and apply padding
 *
 * The container logic is useful for cases like annotating on an image - if the image
 * contains all annotations, we want to export exactly the image bounds without extra padding.
 *
 * @param editor - The editor instance
 * @param renderingShapes - The shapes to include in the export
 * @param padding - Padding to add around the bounds (only applied if no container bounds)
 * @param singleFrameShapeId - If exporting a single frame, this is its ID (skips padding)
 * @returns The calculated bounds box, or null if no shapes to export
 * @internal
 */
export function getExportDefaultBounds(
	editor: Editor,
	renderingShapes: TLRenderingShape[],
	padding: number,
	singleFrameShapeId: TLShapeId | null
): { box: Box; paddingApplied: boolean } | { box: null; paddingApplied: false } {
	let isBoundedByContainer = false
	let bbox: null | Box = null

	for (const { id } of renderingShapes) {
		const maskedPageBounds = editor.getShapeMaskedPageBounds(id)
		if (!maskedPageBounds) continue

		// Check if this shape is an export bounds container (e.g., an image being annotated)
		const shape = editor.getShape(id)!
		const isContainer = editor.getShapeUtil(shape).isExportBoundsContainer(shape)

		if (bbox) {
			// Container logic: if this is a container and it contains all shapes processed so far,
			// use the container's bounds instead of the union. This prevents extra padding around
			// things like annotated images.
			if (isContainer && Box.ContainsApproximately(maskedPageBounds, bbox)) {
				isBoundedByContainer = true
				bbox = maskedPageBounds.clone()
			} else {
				// If we were previously bounded by a container but this shape extends outside it,
				// we're no longer bounded by a container
				if (isBoundedByContainer && !Box.ContainsApproximately(bbox, maskedPageBounds)) {
					isBoundedByContainer = false
				}
				// Expand the bounding box to include this shape
				bbox.union(maskedPageBounds)
			}
		} else {
			// First shape sets the initial bounds
			isBoundedByContainer = isContainer
			bbox = maskedPageBounds.clone()
		}
	}

	// No unmasked shapes to export
	if (!bbox) return { box: null, paddingApplied: false }

	// Only apply padding if:
	// - Not exporting a single frame (frames have their own padding rules)
	// - Not bounded by a container (containers define their own bounds precisely)
	const paddingApplied = !singleFrameShapeId && !isBoundedByContainer
	if (paddingApplied) {
		bbox.expandBy(padding)
	}

	return { box: bbox, paddingApplied }
}
