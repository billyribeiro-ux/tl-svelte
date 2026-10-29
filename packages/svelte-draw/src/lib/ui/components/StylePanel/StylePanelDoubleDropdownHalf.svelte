<script lang="ts" module>
	import type { SharedStyle, StyleProp } from '@svelte-draw/editor'
	import type { StyleValuesForUi } from '../../../styles'
	import type { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'

	/** @internal */
	export interface StylePanelDoubleDropdownHalfProps<T extends string> {
		id: string
		uiType: string
		label: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
		items: StyleValuesForUi<T>
		style: StyleProp<T>
		value: SharedStyle<T>
		onValueChange(style: StyleProp<T>, value: T): void
		sideOffset: number
		invertIcon?: boolean
	}
</script>

<script lang="ts" generics="T extends string">
	import { tlmenus } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { styleMessageId, stylePanelMessages } from '../../styleMessages'
	import StylePanelIcon from './StylePanelIcon.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiPopover from '../primitives/SvelteDrawUiPopover.svelte'
	import SvelteDrawUiPopoverContent from '../primitives/SvelteDrawUiPopoverContent.svelte'
	import SvelteDrawUiPopoverTrigger from '../primitives/SvelteDrawUiPopoverTrigger.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'
	import { getStylePanelContext } from './StylePanelContext'

	let props: StylePanelDoubleDropdownHalfProps<T> = $props()

	const ctx = getStylePanelContext()
	const editor = getEditor()
	const msg = getTranslation()
	let isOpen = $state(false)

	const icon = $derived(
		props.items.find(
			(item) => props.value.type === 'shared' && props.value.value === item.value
		)?.icon ?? 'mixed'
	)
</script>

<SvelteDrawUiPopover id={props.id} open={isOpen} onOpenChange={(open) => (isOpen = open)}>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props: triggerProps })}
			<SvelteDrawUiToolbarButton
				{...triggerProps}
				type="icon"
				data-testid={`style.${props.uiType}`}
				title={msg(props.label) +
					' — ' +
					(props.value === null || props.value.type === 'mixed'
						? msg(stylePanelMessages.mixed)
						: msg(styleMessageId(props.uiType, props.value.value)))}
			>
				<StylePanelIcon {icon} small invertIcon={props.invertIcon} />
			</SvelteDrawUiToolbarButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent
		side="left"
		align="center"
		sideOffset={props.sideOffset}
		alignOffset={0}
	>
		<SvelteDrawUiToolbar orientation="grid" label={msg(props.label)}>
			<SvelteDrawUiMenuContextProvider type="icons" sourceId="style-panel">
				{#each props.items as item (item.value)}
					<SvelteDrawUiToolbarButton
						type="icon"
						data-testid={`style.${props.uiType}.${item.value}`}
						title={`${msg(props.label)} — ${msg(styleMessageId(props.uiType, item.value))}`}
						onclick={() => {
							ctx.onHistoryMark('select style dropdown item')
							props.onValueChange(props.style, item.value)
							tlmenus.deleteOpenMenu(props.id, editor.contextId)
							isOpen = false
						}}
					>
						<StylePanelIcon icon={item.icon} invertIcon={props.invertIcon} />
					</SvelteDrawUiToolbarButton>
				{/each}
			</SvelteDrawUiMenuContextProvider>
		</SvelteDrawUiToolbar>
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
