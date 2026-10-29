<script lang="ts">
	import { createMermaidDiagram } from '@svelte-draw/mermaid'
	import { getEditor } from '@svelte-draw/svelte'
	import {
		type Editor,
		type VecModel,
		allDefaultFontFaces,
		b64Vecs,
		createShapeId,
		exportAs,
		getActions,
		getArrowInfo,
		mockUniqueId,
		toRichText,
	} from 'svelte-draw'
	import type { EndToEndApi } from './EndToEndApi'
	import { checkMermaidReadability } from './mermaidReadability'

	let nextMockShapeId = 0

	const editor = getEditor()
	const actions = getActions()

	function createArrowBindingMarker(editor: Editor, pagePoint: VecModel) {
		const markRadius = 3
		editor.createShape({
			type: 'geo',
			x: pagePoint.x - markRadius,
			y: pagePoint.y - markRadius,
			props: {
				geo: 'ellipse',
				w: markRadius * 2,
				h: markRadius * 2,
				color: 'light-blue',
				fill: 'none',
				dash: 'solid',
				size: 's',
			},
		})
	}

	$effect(() => {
		const resetMockShapeIds = () => {
			nextMockShapeId = 0
			mockUniqueId(() => `mock-${nextMockShapeId++}`)
		}

		const api: EndToEndApi = {
			exportAsSvg: () => actions['export-as-svg'].onSelect('unknown'),
			exportAsFormat: (format) =>
				exportAs(editor, editor.selectAll().getSelectedShapeIds(), { format, name: 'test' }),
			createShapeId: () => createShapeId(),
			resetMockShapeIds,
			createMermaidDiagram: async (definition: string) => {
				await createMermaidDiagram(editor, definition, {
					blueprintRender: {
						position: { x: 0, y: 0 },
						centerOnPosition: false,
					},
				})
			},
			checkMermaidReadability: (definition: string) => checkMermaidReadability(editor, definition),
			toRichText: (text: string) => toRichText(text),
			preloadFonts: async () => {
				// Load every default font face up front. Text geometry is measured from the
				// loaded font, so anything that measures a shape before its font loads (e.g.
				// laying out shapes by their measured bounds) would otherwise get fallback-font
				// metrics until the real font swaps in.
				await Promise.all(allDefaultFontFaces.map((font) => editor.fonts.ensureFontIsLoaded(font)))
			},
			b64VecsEncodePoints: (points: VecModel[]) => b64Vecs.encodePoints(points),
			markAllArrowBindings: () => {
				for (const shape of editor.getCurrentPageShapes()) {
					if (!editor.isShapeOfType(shape, 'arrow')) continue

					const info = getArrowInfo(editor, shape)
					if (!info) continue

					const transform = editor.getShapePageTransform(shape.id)

					if (info.bindings.start) {
						createArrowBindingMarker(editor, transform.applyToPoint(info.start.handle))
					}

					if (info.bindings.end) {
						createArrowBindingMarker(editor, transform.applyToPoint(info.end.handle))
					}
				}
			},
		}
		;(window as unknown as { svelteDrawApi: EndToEndApi }).svelteDrawApi = api
	})
</script>
