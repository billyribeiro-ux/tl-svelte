<script lang="ts">
	import { DefaultDashStyle } from '@svelte-draw/editor'
	import { STYLES } from '../../../styles'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import StylePanelButtonPicker from './StylePanelButtonPicker.svelte'
	import { getStylePanelContext } from './StylePanelContext'

	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const dash = $derived(ctx.styles.get(DefaultDashStyle))
</script>

{#if dash !== undefined}
	<StylePanelButtonPicker
		title={msg(stylePanelMessages.dash)}
		uiType="dash"
		style={DefaultDashStyle}
		items={STYLES.dash}
		value={dash}
	/>
{/if}
