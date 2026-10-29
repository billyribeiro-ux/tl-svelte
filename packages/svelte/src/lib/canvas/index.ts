export { default as CanvasOverlays } from './CanvasOverlays.svelte'
export {
	defaultEditorComponents,
	getEditorComponents,
	setEditorComponents,
} from './componentsContext'
export { default as ContentElementSlot } from './ContentElementSlot.svelte'
export { ContentSlots, setContentSlots, tryGetContentSlots } from './contentSlots'
export { default as DefaultBackground } from './DefaultBackground.svelte'
export { default as DefaultCanvas } from './DefaultCanvas.svelte'
export { default as DefaultCursor } from './DefaultCursor.svelte'
export { default as DefaultGrid } from './DefaultGrid.svelte'
export { default as DefaultLoadingScreen } from './DefaultLoadingScreen.svelte'
export { default as DefaultShapeErrorFallback } from './DefaultShapeErrorFallback.svelte'
export { default as DefaultShapeWrapper } from './DefaultShapeWrapper.svelte'
export { default as DefaultSpinner } from './DefaultSpinner.svelte'
export { default as DefaultSvgDefs } from './DefaultSvgDefs.svelte'
export { default as EditorPortal } from './EditorPortal.svelte'
export { getEditorPortalHost, setEditorPortalHost } from './editorPortal'
export { default as ErrorBoundary } from './ErrorBoundary.svelte'
export { fixSafariDoubleTapZoomPencilEvents } from './fixSafariDoubleTapZoomPencilEvents'
export { gestureEvents } from './gestureEvents'
export { default as HTMLContainer } from './HTMLContainer.svelte'
export { default as InnerShape } from './InnerShape.svelte'
export { default as InnerShapeBackground } from './InnerShapeBackground.svelte'
export { default as LiveCollaborators } from './LiveCollaborators.svelte'
export { markPointerEventsAsHandled } from './markPointerEventsAsHandled'
export { default as MenuClickCapture } from './MenuClickCapture.svelte'
export { default as OptionalErrorBoundary } from './OptionalErrorBoundary.svelte'
export { usePassThroughWheelEvents } from './passThroughWheelEvents'
export { noAutoFocus, preserveFocusOnPointerDown } from './preserveFocus'
export {
	createUniqueSafeId,
	getSharedSafeId,
	hasIdScope,
	sanitizeId,
	setIdScope,
	suffixSafeId,
	type SafeId,
} from './safeId'
export { screenBounds } from './screenBounds'
export { default as Shape } from './Shape.svelte'
export { getShapeCulling, ShapeCulling, setShapeCulling } from './shapeCulling'
export { default as ShapesLayer } from './ShapesLayer.svelte'
export { default as SVGContainer } from './SVGContainer.svelte'
export { transform } from './transform'
export type { ResolvedEditorComponents, TLErrorBoundaryProps } from './types'
export {
	useCanvasEvents,
	type CanvasEventHandlers,
	type CanvasEventName,
	type UseCanvasEvents,
} from './useCanvasEvents.svelte'
export { useCoarsePointer } from './useCoarsePointer.svelte'
export { useDocumentEvents } from './useDocumentEvents.svelte'
export { useGlobalMenuIsOpen } from './useGlobalMenuIsOpen.svelte'
export { useIsCropping, useIsEditing, usePeerIds, usePresence } from './useShapeState.svelte'
export { useStateAttribute } from './useStateAttribute.svelte'
export { useZoomCss } from './useZoomCss.svelte'
export {
	areShapesContentEqual,
	getHtmlLayerTransform,
	getPointerEventButton,
	isDirectDisplayPen,
	isSecondaryClickEvent,
	setStyleProperty,
} from './utils'
export { default as View } from './View.svelte'
