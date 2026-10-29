<script lang="ts">
	import { DefaultSizeStyle, kickoutOccludedShapes } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { STYLES } from '../../../styles'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import StylePanelButtonPicker from './StylePanelButtonPicker.svelte'
	import { getStylePanelContext } from './StylePanelContext'

	const editor = getEditor()
	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const size = $derived(ctx.styles.get(DefaultSizeStyle))
</script>

{#if size !== undefined}
	<StylePanelButtonPicker
		title={msg(stylePanelMessages.size)}
		uiType="size"
		style={DefaultSizeStyle}
		items={STYLES.size}
		value={size}
		onValueChange={(style, value) => {
			ctx.onValueChange(style, value)
			const selectedShapeIds = editor.getSelectedShapeIds()
			if (selectedShapeIds.length > 0) {
				kickoutOccludedShapes(editor, selectedShapeIds)
			}
		}}
	/>
{/if}
