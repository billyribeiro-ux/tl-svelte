<script lang="ts">
	import { DefaultColorStyle, getColorValue, type TLDefaultColorStyle } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getUiComponents } from '../context/components'
	import { createRelevantStyles } from '../hooks/useRelevantStyles'
	import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'
	import { stylePanelMessages } from '../styleMessages'
	import SvelteDrawUiButton from './primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from './primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import { getSvelteDrawUiOrientation } from './primitives/layout.svelte'
	import SvelteDrawUiPopover from './primitives/SvelteDrawUiPopover.svelte'
	import SvelteDrawUiPopoverContent from './primitives/SvelteDrawUiPopoverContent.svelte'
	import SvelteDrawUiPopoverTrigger from './primitives/SvelteDrawUiPopoverTrigger.svelte'

	const editor = getEditor()
	const msg = getTranslation()
	const layout = getSvelteDrawUiOrientation()
	const relevantStyles = createRelevantStyles()
	const color = $derived(relevantStyles.current?.get(DefaultColorStyle))
	const colors = fromComputed(
		'mobile style panel colors',
		() => editor.getCurrentTheme().colors[editor.getColorMode()]
	)
	const currentColor = $derived(
		getColorValue(
			colors.current,
			color?.type === 'shared' ? (color.value as TLDefaultColorStyle) : 'black',
			'solid'
		)
	)

	const disableStylePanel = fromComputed('disable style panel', () =>
		editor.isInAny('hand', 'zoom', 'eraser', 'laser')
	)

	function handleStylesOpenChange(isOpen: boolean) {
		if (!isOpen) {
			editor.updateInstanceState({ isChangingStyle: false })
		}
	}

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
</script>

{#if components.StylePanel}
	{@const StylePanel = components.StylePanel}
	<SvelteDrawUiPopover id="mobile style menu" onOpenChange={handleStylesOpenChange}>
		<SvelteDrawUiPopoverTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiButton
					{...props}
					type="tool"
					data-testid="mobile-styles.button"
					style={`color: ${disableStylePanel.current ? 'var(--tl-color-muted-1)' : currentColor}`}
					title={msg(stylePanelMessages.title)}
					disabled={disableStylePanel.current}
				>
					<SvelteDrawUiButtonIcon
						icon={!disableStylePanel.current && color?.type === 'mixed' ? 'mixed' : 'blob'}
					/>
				</SvelteDrawUiButton>
			{/snippet}
		</SvelteDrawUiPopoverTrigger>
		<SvelteDrawUiPopoverContent
			side={layout.orientation === 'horizontal' ? 'top' : 'right'}
			align="end"
		>
			<StylePanel isMobile />
		</SvelteDrawUiPopoverContent>
	</SvelteDrawUiPopover>
{/if}
