<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		navigationZoneMinimap: { id: 'navigation-zone.minimap', defaultMessage: 'Minimap' },
	})
</script>

<script lang="ts">
	import { Box, getPointerInfo, setPointerCapture, type TLPointerEventInfo, Vec } from '@svelte-draw/editor'
	import {
		createColorMode,
		fromComputed,
		getContainer,
		getEditor,
		usePassThroughWheelEvents,
	} from '@svelte-draw/svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { MinimapManager } from './MinimapManager'


	// Squared distance (in screen pixels) the pointer can move after pointer down before
	// it counts as a drag. Sub-pixel jitter that accompanies a click stays below this, so
	// it doesn't recenter the camera instantly and cut off the easing animation.
	const CLICK_JITTER_THRESHOLD_SQ = 4

	const editor = getEditor()
	const container = getContainer()
	const msg = getTranslation()
	const passThroughWheelEvents = usePassThroughWheelEvents()

	let canvas = $state<HTMLCanvasElement | null>(null)
	let isPointing = false
	let activePointerId: number | null = null
	let originScreenPoint = new Vec()

	let minimap: MinimapManager | undefined

	$effect(() => {
		const canvasElm = canvas
		if (!canvasElm) return
		try {
			const manager = new MinimapManager(editor, canvasElm, container)
			minimap = manager
			return () => {
				manager.close()
				if (minimap === manager) minimap = undefined
			}
		} catch (e) {
			editor.annotateError(e, {
				origin: 'minimap',
				willCrashApp: false,
			})
			editor.timers.setTimeout(() => {
				throw e
			})
			return undefined
		}
	})

	function onDoubleClick(e: MouseEvent) {
		if (!editor.getCurrentPageShapeIds().size) return
		if (!minimap) return

		const { clientX: x, clientY: y } = e

		// Stash the clamped point / clamped viewport page center
		const clampedPoint = minimap.minimapScreenPointToPagePoint(x, y, false, true)
		minimap.originPagePoint.setTo(clampedPoint)
		minimap.originPageCenter.setTo(editor.getViewportPageBounds().center)

		// Then center on the unclamped point
		const point = minimap.minimapScreenPointToPagePoint(x, y, false, false)
		editor.centerOnPoint(point, { animation: { duration: editor.options.animationMediumMs } })
	}

	function onPointerDown(e: PointerEvent) {
		if (!minimap) return
		if (e.button !== 0) return

		const elm = e.currentTarget as HTMLCanvasElement
		setPointerCapture(elm, e)
		if (!editor.getCurrentPageShapeIds().size) return

		const { clientX: x, clientY: y } = e

		isPointing = true
		activePointerId = e.pointerId
		originScreenPoint = new Vec(x, y)

		minimap.isInViewport = false

		const point = minimap.minimapScreenPointToPagePoint(x, y, false, false)

		const vpPageBounds = editor.getViewportPageBounds()
		const commonBounds = minimap.getContentPageBounds()
		const allowedBounds = new Box(
			commonBounds.x - vpPageBounds.width / 2,
			commonBounds.y - vpPageBounds.height / 2,
			commonBounds.width + vpPageBounds.width,
			commonBounds.height + vpPageBounds.height
		)

		// If we clicked inside of the allowed area, but outside of the viewport
		if (allowedBounds.containsPoint(point) && !vpPageBounds.containsPoint(point)) {
			const delta = Vec.Sub(vpPageBounds.center, vpPageBounds.point)
			const pagePoint = Vec.Add(point, delta)
			minimap.originPagePoint.setTo(pagePoint)
			minimap.originPageCenter.setTo(point)
			editor.centerOnPoint(point, { animation: { duration: editor.options.animationMediumMs } })
		} else {
			const clampedPoint = minimap.minimapScreenPointToPagePoint(x, y, false, true)
			minimap.isInViewport = vpPageBounds.containsPoint(clampedPoint)
			minimap.originPagePoint.setTo(clampedPoint)
			minimap.originPageCenter.setTo(vpPageBounds.center)
		}

		const body = editor.getContainerDocument().body

		function endDrag() {
			if (activePointerId !== null && elm.hasPointerCapture(activePointerId)) {
				elm.releasePointerCapture(activePointerId)
			}

			isPointing = false
			activePointerId = null
			body.removeEventListener('pointerup', endDrag)
			body.removeEventListener('pointercancel', endDrag)
			body.removeEventListener('contextmenu', endDrag, true)
		}

		body.addEventListener('pointerup', endDrag)
		body.addEventListener('pointercancel', endDrag)
		body.addEventListener('contextmenu', endDrag, true)
	}

	function onPointerMove(e: PointerEvent) {
		if (!minimap) return

		const { clientX: x, clientY: y } = e

		const point = minimap.minimapScreenPointToPagePoint(x, y, e.shiftKey, true)

		if (isPointing) {
			// Ignore the sub-pixel pointer jitter that accompanies a click, so it doesn't
			// cut off the easing animation started on pointer down.
			if (Vec.Dist2(originScreenPoint, new Vec(x, y)) <= CLICK_JITTER_THRESHOLD_SQ) {
				return
			}

			if (minimap.isInViewport) {
				const delta = minimap.originPagePoint.clone().sub(minimap.originPageCenter)
				editor.centerOnPoint(Vec.Sub(point, delta))
				return
			}

			editor.centerOnPoint(point)
		}

		const pagePoint = minimap.getMinimapPagePoint(x, y)

		const screenPoint = editor.pageToScreen(pagePoint)

		const info: TLPointerEventInfo = {
			type: 'pointer',
			target: 'canvas',
			name: 'pointer_move',
			...getPointerInfo(editor, e),
			point: screenPoint,
			isPen: editor.getInstanceState().isPenMode,
		}

		editor.dispatch(info)
	}

	const colorMode = createColorMode(editor)
	const currentThemeId = fromComputed('current theme id', () => editor.getCurrentThemeId())

	$effect(() => {
		// Track both so a change re-runs the refresh.
		void colorMode.current
		void currentThemeId.current
		// need to wait a tick for next theme css to be applied
		// otherwise the minimap will render with the wrong colors
		editor.timers.setTimeout(() => {
			minimap?.updateColors()
			minimap?.render()
		})
	})
</script>

<div {@attach passThroughWheelEvents} class="tlui-minimap">
	<!-- The React original used role="img" on the canvas; it carries the minimap's accessible name. -->
	<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
	<canvas
		bind:this={canvas}
		role="img"
		aria-label={msg(messages.navigationZoneMinimap)}
		data-testid="minimap.canvas"
		class="tlui-minimap__canvas"
		ondblclick={onDoubleClick}
		onpointermove={onPointerMove}
		onpointerdown={onPointerDown}
	></canvas>
</div>
