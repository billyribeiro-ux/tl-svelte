<script lang="ts">
	import { debugFlags, objectMapValues, tlenv, type ShapeView } from '@svelte-draw/editor'
	import { getContainer, getEditor } from '../context/editor'
	import type { TLCanvasComponentProps } from '../context/components'
	import { fromComputed } from '../state/fromSignal'
	import { quickReactor } from '../state/reactor'
	import CanvasOverlays from './CanvasOverlays.svelte'
	import { getEditorComponents } from './componentsContext'
	import { fixSafariDoubleTapZoomPencilEvents } from './fixSafariDoubleTapZoomPencilEvents'
	import { gestureEvents } from './gestureEvents'
	import GridWrapper from './GridWrapper.svelte'
	import LiveCollaborators from './LiveCollaborators.svelte'
	import MenuClickCapture from './MenuClickCapture.svelte'
	import { hasIdScope, setIdScope } from './safeId'
	import { screenBounds } from './screenBounds'
	import ShapesLayer from './ShapesLayer.svelte'
	import View from './View.svelte'
	import { useCanvasEvents } from './useCanvasEvents.svelte'
	import { useCoarsePointer } from './useCoarsePointer.svelte'
	import { useDocumentEvents } from './useDocumentEvents.svelte'
	import { getHtmlLayerTransform, setStyleProperty } from './utils'
	import { setContentSlots } from './contentSlots'
	import { markPointerEventsAsHandled } from './markPointerEventsAsHandled'

	let { class: className }: TLCanvasComponentProps = $props()

	const editor = getEditor()
	const components = getEditorComponents()
	const container = getContainer()

	// A bare canvas needs an id scope for the collaborator cursor glyph; the root normally starts it.
	if (!hasIdScope()) setIdScope()

	let canvas = $state.raw<HTMLDivElement | null>(null)
	let htmlLayer = $state.raw<HTMLDivElement | null>(null)

	useDocumentEvents()
	useCoarsePointer()

	const events = useCanvasEvents()
	// The registry of app-owned content element slots, shared with ShapesLayer and ContentElementSlot.
	const slots = setContentSlots()

	$effect(() => {
		const canvasEl = canvas
		if (!canvasEl) return
		return quickReactor('update canvas state data attributes', () => {
			canvasEl.setAttribute(
				'data-iseditinganything',
				editor.getEditingShapeId() === null ? 'false' : 'true'
			)
			canvasEl.setAttribute(
				'data-isselectinganything',
				editor.getSelectedShapeIds().length === 0 ? 'false' : 'true'
			)
		})
	})

	$effect(() => {
		const memoizedStuff = { lodDisableTextOutline: false, canUpdateTextOutline: true }
		return quickReactor('set text outline', function setTextOutline() {
			if (memoizedStuff.canUpdateTextOutline) {
				if (tlenv.isSafari) {
					// We don't allow text outlines on safari for performance reasons
					container.style.setProperty('--tl-text-outline', 'none')
					memoizedStuff.canUpdateTextOutline = false // will prevent this check in the future
				} else {
					const efficientZoom = editor.getEfficientZoomLevel()
					// If we're zoomed way out, and have this option enabled, then we hide text outline
					const lodDisableTextOutline = efficientZoom < editor.options.textShadowLod
					// Skip the style update if the property is the same as it was before
					if (lodDisableTextOutline !== memoizedStuff.lodDisableTextOutline) {
						container.style.setProperty(
							'--tl-text-outline',
							lodDisableTextOutline ? 'none' : `var(--tl-text-outline-reference)`
						)
					}
					memoizedStuff.lodDisableTextOutline = lodDisableTextOutline
				}
			}
		})
	})

	$effect(() => {
		const layer = htmlLayer
		return quickReactor('position layers', function positionLayersWhenCameraMoves() {
			setStyleProperty(layer, 'transform', getHtmlLayerTransform(editor))
		})
	})

	const shapeSvgDefs = fromComputed('shapeSvgDefs', () => {
		const shapeSvgDefsByKey = new Map<string, { key: string; view: ShapeView }>()
		for (const util of objectMapValues(editor.shapeUtils)) {
			// NOTE: kept as in the React version: a missing util aborts the whole collection.
			if (!util) return
			const defs = util.getCanvasSvgDefs()
			for (const { key, view } of defs) {
				if (shapeSvgDefsByKey.has(key)) continue
				shapeSvgDefsByKey.set(key, { key, view })
			}
		}
		return [...shapeSvgDefsByKey.values()]
	})

	// Gated on debug mode so a flag left on can't strand the user on a blank canvas with no
	// debug menu to turn it back off.
	const hideShapes = fromComputed(
		'debug_shapes',
		() => debugFlags.hideShapes.get() && editor.getInstanceState().isDebugMode
	)

	const isGridMode = fromComputed('isGridMode', () => editor.getInstanceState().isGridMode)

	const cameraState = fromComputed('camera state', () => editor.getCameraState())

	// Runs before the canvas DOM is removed when the editor is unmounted with an outro
	// (`unmount(app, { outro: true })`), so app-owned content elements are released while their
	// slots are still connected. Svelte removes DOM before running teardowns otherwise; see
	// ContentElementSlot.svelte.
	function releaseContentSlots(_node: Element) {
		slots.releaseAll()
		return { duration: 0 }
	}
</script>

<div
	bind:this={canvas}
	draggable={false}
	class={['tl-canvas', className]}
	data-testid="canvas"
	{@attach events.attach()}
	{@attach screenBounds(editor)}
	{@attach gestureEvents(editor)}
	{@attach fixSafariDoubleTapZoomPencilEvents(editor)}
	out:releaseContentSlots|global
>
	<svg class="tl-svg-context" aria-hidden="true">
		<defs>
			{#each shapeSvgDefs.current ?? [] as def (def.key)}
				<View view={def.view} />
			{/each}
			{#if components.SvgDefs}
				{@const SvgDefs = components.SvgDefs}
				<SvgDefs />
			{/if}
		</defs>
	</svg>
	{#if components.Background}
		{@const Background = components.Background}
		<div class="tl-background__wrapper">
			<Background />
		</div>
	{/if}
	{#if isGridMode.current && components.Grid}
		<GridWrapper />
	{/if}
	<div bind:this={htmlLayer} class="tl-html-layer tl-shapes" draggable={false}>
		{#if components.OnTheCanvas}
			{@const OnTheCanvas = components.OnTheCanvas}
			<OnTheCanvas />
		{/if}
		{#if !hideShapes.current}
			<ShapesLayer {canvas} />
		{/if}
	</div>
	<CanvasOverlays />
	<div
		class={[
			'tl-hit-test-blocker',
			{ 'tl-hit-test-blocker__hidden': cameraState.current === 'idle' },
		]}
	></div>
</div>
{#if components.InFrontOfTheCanvas}
	{@const InFrontOfTheCanvas = components.InFrontOfTheCanvas}
	<div class="tl-canvas__in-front" {@attach markPointerEventsAsHandled(editor)}>
		<InFrontOfTheCanvas />
	</div>
{/if}
<LiveCollaborators />
<MenuClickCapture />
