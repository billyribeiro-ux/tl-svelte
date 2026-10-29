<script lang="ts">
	import {
		DefaultStylePanel,
		StylePanelArrowheadPicker,
		StylePanelArrowKindPicker,
		StylePanelColorPicker,
		StylePanelDashPicker,
		StylePanelFillPicker,
		StylePanelFontPicker,
		StylePanelGeoShapePicker,
		StylePanelLabelAlignPicker,
		StylePanelOpacityPicker,
		StylePanelSection,
		StylePanelSplinePicker,
		StylePanelTextAlignPicker,
		type TLUiStylePanelProps,
	} from 'svelte-draw'
	import StrokeSizePicker from './StrokeSizePicker.svelte'

	// [6]
	// `children` is deliberately not forwarded: this panel supplies its own.
	let { isMobile, styles }: TLUiStylePanelProps = $props()
</script>

<DefaultStylePanel {isMobile} {styles}>
	<StylePanelSection>
		<StylePanelColorPicker />
		<StylePanelOpacityPicker />
	</StylePanelSection>
	<StylePanelSection>
		<StylePanelFillPicker />
		<StylePanelDashPicker />
		<StrokeSizePicker />
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
</DefaultStylePanel>
