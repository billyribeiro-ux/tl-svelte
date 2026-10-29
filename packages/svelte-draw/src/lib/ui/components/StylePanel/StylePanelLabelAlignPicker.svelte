<script lang="ts">
	import { DefaultHorizontalAlignStyle, DefaultVerticalAlignStyle } from '@svelte-draw/editor'
	import { STYLES } from '../../../styles'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'
	import StylePanelButtonPickerInline from './StylePanelButtonPickerInline.svelte'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelDropdownPickerInline from './StylePanelDropdownPickerInline.svelte'
	import StylePanelSubheading from './StylePanelSubheading.svelte'

	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const labelAlign = $derived(ctx.styles.get(DefaultHorizontalAlignStyle))
	const verticalLabelAlign = $derived(ctx.styles.get(DefaultVerticalAlignStyle))
	const title = $derived(msg(stylePanelMessages['label-align']))
</script>

{#if labelAlign !== undefined}
	{#if ctx.enhancedA11yMode}<StylePanelSubheading>{title}</StylePanelSubheading>{/if}
	<SvelteDrawUiToolbar orientation="horizontal" label={title}>
		<StylePanelButtonPickerInline
			{title}
			uiType="align"
			style={DefaultHorizontalAlignStyle}
			items={STYLES.horizontalAlign}
			value={labelAlign}
		/>
		{#if verticalLabelAlign === undefined}
			<SvelteDrawUiToolbarButton
				type="icon"
				title={msg(stylePanelMessages['vertical-align'])}
				data-testid="vertical-align"
				disabled
			>
				<SvelteDrawUiButtonIcon icon="vertical-align-middle" />
			</SvelteDrawUiToolbarButton>
		{:else}
			<StylePanelDropdownPickerInline
				type="icon"
				id="geo-vertical-alignment"
				uiType="verticalAlign"
				stylePanelType="vertical-align"
				style={DefaultVerticalAlignStyle}
				items={STYLES.verticalAlign}
				value={verticalLabelAlign}
				sideOffset={116}
			/>
		{/if}
	</SvelteDrawUiToolbar>
{/if}
