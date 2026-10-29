<script lang="ts">
	import { react } from '@svelte-draw/state'
	import { Mat, type ShapeUtil, type TLShape, type TLShapeId } from '@svelte-draw/editor'
	import { untrack } from 'svelte'
	import { getEditor } from '../context/editor'
	import { quickReactor } from '../state/reactor'
	import { getEditorComponents } from './componentsContext'
	import ContentElementSlot from './ContentElementSlot.svelte'
	import InnerShape from './InnerShape.svelte'
	import InnerShapeBackground from './InnerShapeBackground.svelte'
	import OptionalErrorBoundary from './OptionalErrorBoundary.svelte'
	import { getShapeCulling } from './shapeCulling'
	import { setStyleProperty } from './utils'

	/*
	This component renders shapes on the canvas. There are two stages: positioning
	and styling the shape's container using CSS, and then rendering the shape's
	view using its shape util's component method. Rendering the "inside" of a shape is
	more expensive than positioning it or changing its color, so the inner shape is its own
	component and only re-renders when the shape's props or meta change (or a signal it reads).

	The shape also receives props for its index and opacity. The index is used to
	determine the z-index of the shape, and the opacity is used to set the shape's
	opacity based on its own opacity and that of its parent's.
	*/
	let {
		id,
		shape,
		util,
		index,
		backgroundIndex,
		opacity,
	}: {
		id: TLShapeId
		shape: TLShape
		util: ShapeUtil
		index: number
		backgroundIndex: number
		opacity: number
	} = $props()

	// Value-stable copies: effects below depend on the id/util values, not on the parent's reactive
	// item that happens to hold them (which is replaced on every change of any field).
	const shapeId = $derived(id)
	const shapeUtil = $derived(util)

	const editor = getEditor()
	const components = getEditorComponents()
	const culling = getShapeCulling()

	// Bound to the ShapeWrapper's root element(s).
	let container = $state.raw<HTMLDivElement | null>(null)
	let bgContainer = $state.raw<HTMLDivElement | null>(null)

	$effect(() => {
		const currentId = shapeId
		return react('load fonts', () => {
			const fonts = editor.fonts.getShapeFontFaces(currentId)
			editor.fonts.requestFonts(fonts)
		})
	})

	$effect(() => {
		const currentId = shapeId
		const containerEl = container
		const bgContainerEl = bgContainer

		// Reset the memo whenever the wrapper elements change so a swapped element gets styled.
		const prev = {
			transform: '',
			clipPath: 'none',
			width: 0,
			height: 0,
			x: 0,
			y: 0,
		}

		return untrack(() =>
			quickReactor('set shape stuff', () => {
				const shape = editor.getShape(currentId)
				if (!shape) return // probably the shape was just deleted

				// Clip path
				const clipPath = editor.getShapeClipPath(currentId) ?? 'none'
				if (clipPath !== prev.clipPath) {
					setStyleProperty(containerEl, 'clip-path', clipPath)
					setStyleProperty(bgContainerEl, 'clip-path', clipPath)
					prev.clipPath = clipPath
				}

				// Page transform
				const pageTransform = editor.getShapePageTransform(currentId)
				const transform = Mat.toCssString(pageTransform)
				const bounds = editor.getShapeGeometry(shape).bounds

				// Update if the tranform has changed
				if (transform !== prev.transform) {
					setStyleProperty(containerEl, 'transform', transform)
					setStyleProperty(bgContainerEl, 'transform', transform)
					prev.transform = transform
				}

				// Width / Height
				const width = Math.max(bounds.width, 1)
				const height = Math.max(bounds.height, 1)

				if (width !== prev.width || height !== prev.height) {
					setStyleProperty(containerEl, 'width', width + 'px')
					setStyleProperty(containerEl, 'height', height + 'px')
					setStyleProperty(bgContainerEl, 'width', width + 'px')
					setStyleProperty(bgContainerEl, 'height', height + 'px')
					prev.width = width
					prev.height = height
				}
			})
		)
	})

	// This stuff changes pretty infrequently, so we can change them together
	$effect(() => {
		// Opacity
		setStyleProperty(container, 'opacity', opacity)
		setStyleProperty(bgContainer, 'opacity', opacity)

		// Z-Index
		setStyleProperty(container, 'z-index', index)
		setStyleProperty(bgContainer, 'z-index', backgroundIndex)
	})

	// Register container refs with the centralized culling context.
	// This runs on mount and handles initial display state.
	$effect(() => {
		const currentId = shapeId
		const containerEl = container
		if (!containerEl) return

		// Check initial culling state and register with the context
		const isCulled = editor.getCulledShapes().has(currentId)
		culling.register(currentId, containerEl, bgContainer, isCulled)

		return () => {
			culling.unregister(currentId)
		}
	})

	const annotateError = (error: unknown) =>
		editor.annotateError(error, { origin: 'shape', willCrashApp: false })
</script>

{#if shape && components.ShapeWrapper}
	{@const ShapeWrapper = components.ShapeWrapper}
	{@const ShapeErrorFallback = components.ShapeErrorFallback ?? null}
	{#if util.backgroundComponent}
		<ShapeWrapper bind:ref={bgContainer} {shape} isBackground={true}>
			<OptionalErrorBoundary fallback={ShapeErrorFallback} onError={annotateError}>
				<InnerShapeBackground {shape} util={shapeUtil} />
			</OptionalErrorBoundary>
		</ShapeWrapper>
	{/if}
	<ShapeWrapper bind:ref={container} {shape} isBackground={false}>
		<OptionalErrorBoundary fallback={ShapeErrorFallback} onError={annotateError}>
			<InnerShape {shape} util={shapeUtil} />
		</OptionalErrorBoundary>
		{#if util.getAppOwnedElement}
			<ContentElementSlot id={shapeId} util={shapeUtil} />
		{/if}
	</ShapeWrapper>
{/if}
