<script lang="ts">
	import { DefaultColorStyle } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getColorStyleItems } from '../../../styles'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import StylePanelButtonPicker from './StylePanelButtonPicker.svelte'
	import { getStylePanelContext } from './StylePanelContext'

	const editor = getEditor()
	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const color = $derived(ctx.styles.get(DefaultColorStyle))
	const items = fromComputed('style panel color items', () =>
		getColorStyleItems(editor.getCurrentTheme().colors[editor.getColorMode()])
	)
</script>

{#if color !== undefined}
	<StylePanelButtonPicker
		title={msg(stylePanelMessages.color)}
		uiType="color"
		style={DefaultColorStyle}
		items={items.current}
		value={color}
	/>
{/if}
