<script lang="ts">
	import { LineShapeSplineStyle } from '@svelte-draw/editor'
	import { STYLES } from '../../../styles'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelDropdownPicker from './StylePanelDropdownPicker.svelte'

	const ctx = getStylePanelContext()
	const spline = $derived(ctx.styles.get(LineShapeSplineStyle))
</script>

{#if spline !== undefined}
	<StylePanelDropdownPicker
		type="menu"
		id="spline"
		uiType="spline"
		stylePanelType="spline"
		label="style-panel.spline"
		style={LineShapeSplineStyle}
		items={STYLES.spline}
		value={spline}
	/>
{/if}
