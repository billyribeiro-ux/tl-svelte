<script lang="ts">
	import { DefaultFontStyle } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getFontStyleItems } from '../../../styles'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import StylePanelButtonPicker from './StylePanelButtonPicker.svelte'
	import { getStylePanelContext } from './StylePanelContext'

	const editor = getEditor()
	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const font = $derived(ctx.styles.get(DefaultFontStyle))
	const items = fromComputed('style panel font items', () =>
		getFontStyleItems(editor.getCurrentTheme())
	)
</script>

{#if font !== undefined}
	<StylePanelButtonPicker
		title={msg(stylePanelMessages.font)}
		uiType="font"
		style={DefaultFontStyle}
		items={items.current}
		value={font}
	/>
{/if}
