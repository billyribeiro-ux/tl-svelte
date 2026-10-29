<script lang="ts">
	import { ArrowShapeKindStyle } from '@svelte-draw/editor'
	import { STYLES } from '../../../styles'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelDropdownPicker from './StylePanelDropdownPicker.svelte'

	const ctx = getStylePanelContext()
	const arrowKind = $derived(ctx.styles.get(ArrowShapeKindStyle))
</script>

{#if arrowKind !== undefined}
	<StylePanelDropdownPicker
		id="arrow-kind"
		type="menu"
		label="style-panel.arrow-kind"
		uiType="arrow-kind"
		stylePanelType="arrow-kind"
		style={ArrowShapeKindStyle}
		items={STYLES.arrowKind}
		value={arrowKind}
	/>
{/if}
