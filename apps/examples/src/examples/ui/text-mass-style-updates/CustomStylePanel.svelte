<script lang="ts">
	import {
		DefaultStylePanel,
		DefaultStylePanelContent,
		fromComputed,
		getEditor,
		type TLUiStylePanelProps,
	} from 'svelte-draw'
	import { STYLES, isRichTextShape } from './richTextMarks'
	import StyleButton from './StyleButton.svelte'

	// [3]
	const props: TLUiStylePanelProps = $props()

	const editor = getEditor()

	const allTextShapeIds = fromComputed('text shape ids', () => {
		const allIds = editor.getShapeAndDescendantIds(editor.getSelectedShapeIds())
		return [...allIds].filter((id) => {
			const shape = editor.getShape(id)
			return !!shape && isRichTextShape(shape)
		})
	})

	const hasTextShapes = $derived(allTextShapeIds.current.length > 0)
</script>

<DefaultStylePanel {...props}>
	{#if hasTextShapes}
		<div class="tlui-style-panel__section">
			{#each STYLES as { style, icon, label } (style)}
				<StyleButton {style} {icon} {label} textShapeIds={allTextShapeIds.current} />
			{/each}
		</div>
	{/if}
	<DefaultStylePanelContent />
</DefaultStylePanel>
