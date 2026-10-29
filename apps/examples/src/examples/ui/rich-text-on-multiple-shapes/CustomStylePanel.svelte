<script lang="ts">
	import {
		DefaultStylePanel,
		DefaultStylePanelContent,
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiButtonLabel,
		fromComputed,
		getEditor,
		type ExtractShapeByProps,
		type TLRichText,
		type TLShape,
		type TLUiStylePanelProps,
	} from 'svelte-draw'
	import { isAllTextBold, makeAllTextBold, removeBoldFromAllText } from './richTextBold'

	type ShapeWithRichText = ExtractShapeByProps<{ richText: TLRichText }>

	function isShapeWithRichText(shape: TLShape | null | undefined): shape is ShapeWithRichText {
		return !!(shape && 'richText' in shape.props)
	}

	// [2]
	const props: TLUiStylePanelProps = $props()

	const editor = getEditor()

	const shapesWithRichText = fromComputed('shapes with rich text', () =>
		editor.getSelectedShapes().filter(isShapeWithRichText)
	)
	const hasRichTextSelection = $derived(shapesWithRichText.current.length > 0)

	const allBold = $derived(
		hasRichTextSelection &&
			shapesWithRichText.current.every((shape) => isAllTextBold(shape.props.richText))
	)

	function handleToggleBold() {
		if (!hasRichTextSelection) return

		// [3]
		editor.run(() => {
			editor.markHistoryStoppingPoint('toggle bold')
			editor.updateShapes(
				shapesWithRichText.current.map((shape) => ({
					id: shape.id,
					type: shape.type,
					props: {
						richText: allBold
							? removeBoldFromAllText(shape.props.richText)
							: makeAllTextBold(shape.props.richText),
					},
				}))
			)
		})
	}
</script>

<DefaultStylePanel {...props}>
	<div class="tlui-style-panel__section">
		<SvelteDrawUiButton
			type="menu"
			isActive={allBold}
			onclick={handleToggleBold}
			title="Bold all text in selected shapes"
			disabled={!hasRichTextSelection}
		>
			<SvelteDrawUiButtonIcon icon="bold" />
			<SvelteDrawUiButtonLabel>Bold all text</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</div>
	<DefaultStylePanelContent />
</DefaultStylePanel>
