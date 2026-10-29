<script lang="ts">
	import StylePanelArrowheadPicker from './StylePanelArrowheadPicker.svelte'
	import StylePanelArrowKindPicker from './StylePanelArrowKindPicker.svelte'
	import StylePanelColorPicker from './StylePanelColorPicker.svelte'
	import StylePanelDashPicker from './StylePanelDashPicker.svelte'
	import StylePanelFillPicker from './StylePanelFillPicker.svelte'
	import StylePanelFontPicker from './StylePanelFontPicker.svelte'
	import StylePanelGeoShapePicker from './StylePanelGeoShapePicker.svelte'
	import StylePanelLabelAlignPicker from './StylePanelLabelAlignPicker.svelte'
	import StylePanelOpacityPicker from './StylePanelOpacityPicker.svelte'
	import StylePanelSection from './StylePanelSection.svelte'
	import StylePanelSizePicker from './StylePanelSizePicker.svelte'
	import StylePanelSplinePicker from './StylePanelSplinePicker.svelte'
	import StylePanelTextAlignPicker from './StylePanelTextAlignPicker.svelte'
</script>

<StylePanelSection>
	<StylePanelColorPicker />
	<StylePanelOpacityPicker />
</StylePanelSection>
<StylePanelSection>
	<StylePanelFillPicker />
	<StylePanelDashPicker />
	<StylePanelSizePicker />
</StylePanelSection>
<StylePanelSection>
	<StylePanelFontPicker />
	<StylePanelTextAlignPicker />
	<StylePanelLabelAlignPicker />
</StylePanelSection>
<StylePanelSection>
	<StylePanelGeoShapePicker />
	<StylePanelArrowKindPicker />
	<StylePanelArrowheadPicker />
	<StylePanelSplinePicker />
</StylePanelSection>
