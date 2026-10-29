<script lang="ts">
	import { DefaultFillStyle } from '@svelte-draw/editor'
	import { STYLES } from '../../../styles'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import StylePanelButtonPickerInline from './StylePanelButtonPickerInline.svelte'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelDropdownPickerInline from './StylePanelDropdownPickerInline.svelte'
	import StylePanelSubheading from './StylePanelSubheading.svelte'

	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const fill = $derived(ctx.styles.get(DefaultFillStyle))

	const title = $derived(msg(stylePanelMessages.fill))
</script>

{#if fill !== undefined}
	{#if ctx.enhancedA11yMode}<StylePanelSubheading>{title}</StylePanelSubheading>{/if}
	<SvelteDrawUiToolbar orientation="horizontal" label={title}>
		<StylePanelButtonPickerInline
			{title}
			uiType="fill"
			style={DefaultFillStyle}
			items={STYLES.fill}
			value={fill}
		/>
		<StylePanelDropdownPickerInline
			type="icon"
			id="fill-extra"
			uiType="fill"
			testIdType="fill-extra"
			stylePanelType="fill"
			style={DefaultFillStyle}
			items={STYLES.fillExtra}
			value={fill}
			sideOffset={116}
			isOverflow
		/>
	</SvelteDrawUiToolbar>
{/if}
