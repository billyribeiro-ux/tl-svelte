<script lang="ts" generics="T extends string">
	import { tlmenus } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import type { TLUiIconType } from '../../icon-types'
	import { styleMessageId, stylePanelMessageId, stylePanelMessages } from '../../styleMessages'
	import StylePanelIcon from './StylePanelIcon.svelte'
	import SvelteDrawUiButtonLabel from '../primitives/Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiPopover from '../primitives/SvelteDrawUiPopover.svelte'
	import SvelteDrawUiPopoverContent from '../primitives/SvelteDrawUiPopoverContent.svelte'
	import SvelteDrawUiPopoverTrigger from '../primitives/SvelteDrawUiPopoverTrigger.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'
	import type { StylePanelDropdownPickerProps } from './StylePanelDropdownPicker.svelte'
	import { getStylePanelContext } from './StylePanelContext'

	let props: StylePanelDropdownPickerProps<T> = $props()

	const ctx = getStylePanelContext()
	const msg = getTranslation()
	const editor = getEditor()
	let isOpen = $state(false)

	const testIdType = $derived(props.testIdType ?? props.uiType)
	const sideOffset = $derived(props.sideOffset ?? 8)

	const icon = $derived.by(() => {
		if (props.value.type === 'mixed') return 'mixed' as TLUiIconType
		const value = props.value.value
		const match = props.items.find((item) => item.value === value)?.icon
		return match ?? props.items[0]?.icon
	})

	const stylePanelName = $derived(msg(stylePanelMessageId(props.stylePanelType)))

	// The current value isn't always present in this dropdown's items (for example the fill
	// dropdown only holds the "extra" fills, so a "solid" selection lives elsewhere). When the
	// selected value isn't one of these items, describe what the dropdown opens rather than a
	// value it can't show.
	const valueInItems = $derived(
		props.value.type !== 'mixed' &&
			props.items.some((item) => item.value === (props.value as { value: T }).value)
	)
	const titleStr = $derived(
		props.value.type === 'mixed'
			? msg(stylePanelMessages.mixed)
			: valueInItems
				? stylePanelName + ' — ' + msg(styleMessageId(props.uiType, props.value.value))
				: stylePanelName
	)
	const labelStr = $derived(props.label ? msg(props.label) : '')

	const popoverId = $derived(`style panel ${props.id}`)
</script>

<SvelteDrawUiPopover
	id={popoverId}
	open={isOpen}
	onOpenChange={(open) => (isOpen = open)}
	class="tlui-style-panel__dropdown-picker"
>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props: triggerProps })}
			<SvelteDrawUiToolbarButton
				{...triggerProps}
				type={props.type}
				data-testid={`style.${testIdType}`}
				data-direction="left"
				isActive={props.isOverflow && valueInItems}
				title={titleStr}
			>
				{#if labelStr}<SvelteDrawUiButtonLabel>{labelStr}</SvelteDrawUiButtonLabel>{/if}
				<StylePanelIcon {icon} />
			</SvelteDrawUiToolbarButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent side="left" align="center" {sideOffset}>
		<SvelteDrawUiToolbar
			orientation={props.items.length > 4 ? 'grid' : 'horizontal'}
			label={labelStr}
		>
			<SvelteDrawUiMenuContextProvider type="icons" sourceId="style-panel">
				{#each props.items as item (item.value)}
					<SvelteDrawUiToolbarButton
						type="icon"
						data-testid={`style.${testIdType}.${item.value}`}
						title={stylePanelName + ' — ' + msg(styleMessageId(props.uiType, item.value))}
						isActive={valueInItems && icon === item.icon}
						onclick={() => {
							ctx.onHistoryMark('select style dropdown item')
							;(props.onValueChange ?? ctx.onValueChange)(props.style, item.value)
							tlmenus.deleteOpenMenu(popoverId, editor.contextId)
							isOpen = false
						}}
					>
						<StylePanelIcon icon={item.icon} />
					</SvelteDrawUiToolbarButton>
				{/each}
			</SvelteDrawUiMenuContextProvider>
		</SvelteDrawUiToolbar>
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
