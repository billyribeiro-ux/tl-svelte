<script lang="ts">
	import {
		SvelteDraw,
		getIndicesBetween,
		react,
		sortByIndex,
		type Editor,
		type StateNode,
		type TLClickEventInfo,
		type TLComponents,
		type TLImageShape,
		type TLShapePartial,
	} from 'svelte-draw'
	import { MarkingTool } from '../add-mark-tool'
	import { EXAM_MARK_HEIGHT, EXAM_MARK_WIDTH, ExamMarkUtil } from '../add-mark-util'
	import { components as uiComponents, uiOverrides } from '../ui-overrides'
	import ExamSharePanel from '../ExamSharePanel.svelte'
	import PageOverlayScreen from './PageOverlayScreen.svelte'
	import { setPdf } from './pdfContext'
	import type { Pdf } from './PdfPicker.svelte'

	let { pdf }: { pdf: Pdf } = $props()

	// The overlay, score label and export button read the PDF back out of context.
	setPdf({
		get current() {
			return pdf
		},
	})

	const customShapeUtils = [ExamMarkUtil]
	const customTools = [MarkingTool]

	const pdfEditorComponents: TLComponents = {
		PageMenu: null,
		OnTheCanvas: PageOverlayScreen,
		SharePanel: ExamSharePanel,
		...uiComponents,
	}

	function onMount(editor: Editor) {
			// [1]
			type IdleStateNode = StateNode & {
				handleDoubleClickOnCanvas(info: TLClickEventInfo): void
			}
	
			const selectIdleState = editor.getStateDescendant<IdleStateNode>('select.idle')
			if (!selectIdleState) throw Error('SelectTool Idle state not found')
	
			function customDoubleClickOnCanvasHandler(_info: TLClickEventInfo) {
				const pagePoint = editor.inputs.getCurrentPagePoint()
				editor.createShape({
					type: 'exam-mark',
					x: pagePoint.x - EXAM_MARK_WIDTH / 2,
					y: pagePoint.y - EXAM_MARK_HEIGHT / 2,
				})
			}
	
			selectIdleState.handleDoubleClickOnCanvas =
				customDoubleClickOnCanvasHandler.bind(selectIdleState)
	
			editor.createAssets(
				pdf.pages.map((page) => ({
					id: page.assetId,
					typeName: 'asset',
					type: 'image',
					meta: {},
					props: {
						w: page.bounds.w,
						h: page.bounds.h,
						mimeType: 'image/png',
						src: page.src,
						name: 'page',
						isAnimated: false,
					},
				}))
			)
			editor.createShapes(
				pdf.pages.map(
					(page): TLShapePartial<TLImageShape> => ({
						id: page.shapeId,
						type: 'image',
						x: page.bounds.x,
						y: page.bounds.y,
						isLocked: true,
						props: {
							assetId: page.assetId,
							w: page.bounds.w,
							h: page.bounds.h,
						},
					})
				)
			)
	
			const shapeIds = pdf.pages.map((page) => page.shapeId)
			const shapeIdSet = new Set(shapeIds)
	
			// Don't let the user unlock the pages
			editor.sideEffects.registerBeforeChangeHandler('shape', (prev, next) => {
				if (!shapeIdSet.has(next.id)) return next
				if (next.isLocked) return next
				return { ...prev, isLocked: true }
			})
	
			// Make sure the shapes are below any of the other shapes
			function makeSureShapesAreAtBottom() {
				const shapes = shapeIds.map((id) => editor.getShape(id)!).sort(sortByIndex)
				const pageId = editor.getCurrentPageId()
	
				const siblings = editor.getSortedChildIdsForParent(pageId)
				const currentBottomShapes = siblings
					.slice(0, shapes.length)
					.map((id) => editor.getShape(id)!)
	
				if (currentBottomShapes.every((shape, i) => shape.id === shapes[i].id)) return
	
				const otherSiblings = siblings.filter((id) => !shapeIdSet.has(id))
				const bottomSibling = otherSiblings[0]
				const lowestIndex = editor.getShape(bottomSibling)!.index
	
				const indexes = getIndicesBetween(undefined, lowestIndex, shapes.length)
				editor.updateShapes(
					shapes.map((shape, i) => ({
						...shape,
						id: shape.id,
						isLocked: shape.isLocked,
						index: indexes[i],
					}))
				)
			}
	
			makeSureShapesAreAtBottom()
			editor.sideEffects.registerAfterCreateHandler('shape', makeSureShapesAreAtBottom)
			editor.sideEffects.registerAfterChangeHandler('shape', makeSureShapesAreAtBottom)
	
			// Constrain the camera to the bounds of the pages
			const targetBounds = pdf.pages.reduce(
				(acc, page) => acc.union(page.bounds),
				pdf.pages[0].bounds.clone()
			)
	
			function updateCameraBounds(isMobile: boolean) {
				editor.setCameraOptions({
					constraints: {
						bounds: targetBounds,
						padding: { x: isMobile ? 16 : 164, y: 64 },
						origin: { x: 0.5, y: 0 },
						initialZoom: 'fit-x-100',
						baseZoom: 'default',
						behavior: 'contain',
					},
				})
				editor.setCamera(editor.getCamera(), { reset: true })
			}
	
			let isMobile = editor.getViewportScreenBounds().width < 840
	
			const stopReacting = react('update camera', () => {
				const isMobileNow = editor.getViewportScreenBounds().width < 840
				if (isMobileNow === isMobile) return
				isMobile = isMobileNow
				updateCameraBounds(isMobile)
			})
	
			updateCameraBounds(isMobile)
	
			return stopReacting
	}
</script>

<SvelteDraw
	{onMount}
	components={pdfEditorComponents}
	tools={customTools}
	initialState="mark"
	shapeUtils={customShapeUtils}
	overrides={uiOverrides}
/>

<!--
[1]
Double-clicking empty canvas normally creates a text shape. Overriding the select tool's
`select.idle` handler makes it place an exam mark instead. See the
custom-double-click-behavior example for details on this technique. The rest of this file
is the pdf-editor example, with footnotes explained there.
-->
