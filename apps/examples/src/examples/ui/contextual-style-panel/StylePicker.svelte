<script lang="ts" generics="T extends string">
	import { getEditor } from '@svelte-draw/svelte'
	import {
		getTranslation,
		SvelteDrawUiPopover,
		SvelteDrawUiPopoverContent,
		SvelteDrawUiPopoverTrigger,
		SvelteDrawUiToolbar,
		SvelteDrawUiToolbarButton,
		tlmenus,
		type SharedStyle,
		type StyleProp,
		type StyleValuesForUi,
	} from 'svelte-draw'

	import StyleIcon from './StyleIcon.svelte'

	let {
		uiType,
		style,
		value,
		items,
		labelKey,
		getItemColor,
	}: {
		uiType: string
		style: StyleProp<T>
		value: SharedStyle<T>
		items: StyleValuesForUi<T>
		/** Defaults to `style-panel.<uiType>`. Pass this when the two don't line up. */
		labelKey?: string
		getItemColor?(value: T): string
	} = $props()

	// [3]
	const editor = getEditor()
	const msg = getTranslation()
	let isOpen = $state(false)

	// [4]
	const popoverId = $derived(`contextual style ${style.id}`)
	const label = $derived(msg(labelKey ?? `style-panel.${uiType}`))
	const icon = $derived(
		value.type === 'mixed'
			? 'mixed'
			: (items.find((item) => item.value === value.value)?.icon ?? items[0]?.icon)
	)

	// [5]
	function handleSelect(next: T) {
		editor.markHistoryStoppingPoint('contextual style panel')
		editor.run(() => {
			editor.setStyleForSelectedShapes(style, next)
			editor.setStyleForNextShapes(style, next)
		})
		// [6]
		tlmenus.deleteOpenMenu(popoverId, editor.contextId)
		isOpen = false
	}

	function colorStyle(color: string | undefined) {
		return color ? `color: ${color}` : undefined
	}
</script>

<SvelteDrawUiPopover id={popoverId} open={isOpen} onOpenChange={(open) => (isOpen = open)}>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiToolbarButton
				{...props}
				type="icon"
				title={label}
				style={value.type === 'shared' ? colorStyle(getItemColor?.(value.value)) : undefined}
			>
				<StyleIcon {icon} />
			</SvelteDrawUiToolbarButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent side="bottom" align="center" sideOffset={8}>
		<SvelteDrawUiToolbar
			class="tlui-menu"
			orientation={items.length > 4 ? 'grid' : 'horizontal'}
			{label}
		>
			{#each items as item (item.value)}
				<SvelteDrawUiToolbarButton
					type="icon"
					title={msg(`${uiType}-style.${item.value}`)}
					isActive={value.type === 'shared' && value.value === item.value}
					style={colorStyle(getItemColor?.(item.value))}
					onclick={() => handleSelect(item.value)}
				>
					<StyleIcon icon={item.icon} />
				</SvelteDrawUiToolbarButton>
			{/each}
		</SvelteDrawUiToolbar>
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
