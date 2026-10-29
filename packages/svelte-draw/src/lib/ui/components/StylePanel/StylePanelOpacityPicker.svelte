<script lang="ts" module>
	const svelteDrawSupportedOpacities = [0.1, 0.25, 0.5, 0.75, 1] as const
</script>

<script lang="ts">
	import { minBy } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../../styleMessages'
	import SvelteDrawUiSlider from '../primitives/SvelteDrawUiSlider.svelte'
	import { getStylePanelContext } from './StylePanelContext'
	import StylePanelSubheading from './StylePanelSubheading.svelte'

	const editor = getEditor()
	const ctx = getStylePanelContext()

	const opacity = fromComputed('opacity', () => editor.getSharedOpacity())
	const msg = getTranslation()

	function handleOpacityValueChange(value: number) {
		ctx.onOpacityChange(svelteDrawSupportedOpacities[value])
	}

	const opacityIndex = $derived.by(() => {
		const current = opacity.current
		if (current === undefined) return -1
		return current.type === 'mixed'
			? -1
			: svelteDrawSupportedOpacities.indexOf(
					minBy(svelteDrawSupportedOpacities, (supportedOpacity) =>
						Math.abs(supportedOpacity - current.value)
					)!
				)
	})
</script>

{#if opacity.current !== undefined}
	{#if ctx.enhancedA11yMode}
		<StylePanelSubheading>{msg(stylePanelMessages.opacity)}</StylePanelSubheading>
	{/if}
	<SvelteDrawUiSlider
		data-testid="style.opacity"
		value={opacityIndex >= 0 ? opacityIndex : svelteDrawSupportedOpacities.length - 1}
		label={opacity.current.type === 'mixed'
			? 'style-panel.mixed'
			: `opacity-style.${opacity.current.value}`}
		onValueChange={handleOpacityValueChange}
		steps={svelteDrawSupportedOpacities.length - 1}
		title={msg(stylePanelMessages.opacity)}
		onHistoryMark={ctx.onHistoryMark}
		ariaValueModifier={25}
	/>
{/if}
