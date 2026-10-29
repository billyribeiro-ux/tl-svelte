<script lang="ts">
	import { DefaultTextAlignStyle } from '@svelte-draw/editor'
	import { STYLES } from '../../../styles'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'
	import StylePanelButtonPickerInline from './StylePanelButtonPickerInline.svelte'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelSubheading from './StylePanelSubheading.svelte'

	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const textAlign = $derived(ctx.styles.get(DefaultTextAlignStyle))
	const title = $derived(msg(stylePanelMessages.align))
</script>

{#if textAlign !== undefined}
	{#if ctx.enhancedA11yMode}<StylePanelSubheading>{title}</StylePanelSubheading>{/if}
	<SvelteDrawUiToolbar orientation="horizontal" label={title}>
		<StylePanelButtonPickerInline
			{title}
			uiType="align"
			style={DefaultTextAlignStyle}
			items={STYLES.textAlign}
			value={textAlign}
		/>
		<SvelteDrawUiToolbarButton
			type="icon"
			title={msg(stylePanelMessages['vertical-align'])}
			data-testid="vertical-align"
			disabled
		>
			<SvelteDrawUiButtonIcon icon="vertical-align-middle" />
		</SvelteDrawUiToolbarButton>
	</SvelteDrawUiToolbar>
{/if}
