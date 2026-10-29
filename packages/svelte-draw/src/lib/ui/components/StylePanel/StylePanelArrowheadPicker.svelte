<script lang="ts">
	import { ArrowShapeArrowheadEndStyle, ArrowShapeArrowheadStartStyle } from '@svelte-draw/editor'
	import { STYLES } from '../../../styles'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelDoubleDropdownPicker from './StylePanelDoubleDropdownPicker.svelte'

	const ctx = getStylePanelContext()
	const arrowheadEnd = $derived(ctx.styles.get(ArrowShapeArrowheadEndStyle))
	const arrowheadStart = $derived(ctx.styles.get(ArrowShapeArrowheadStartStyle))
</script>

{#if arrowheadEnd !== undefined && arrowheadStart !== undefined}
	<StylePanelDoubleDropdownPicker
		label="style-panel.arrowheads"
		uiTypeA="arrowheadStart"
		styleA={ArrowShapeArrowheadStartStyle}
		itemsA={STYLES.arrowheadStart}
		valueA={arrowheadStart}
		uiTypeB="arrowheadEnd"
		styleB={ArrowShapeArrowheadEndStyle}
		itemsB={STYLES.arrowheadEnd}
		valueB={arrowheadEnd}
		labelA="style-panel.arrowhead-start"
		labelB="style-panel.arrowhead-end"
	/>
{/if}
