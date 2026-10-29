<script lang="ts" module>
	import type { TLUiMenuItemProps } from './SvelteDrawUiMenuItem.svelte'

	/** @private */
	export interface DraggableToolbarButtonProps {
		id: string
		disabled: boolean
		labelStr?: string
		titleStr?: string
		isSelected?: boolean
		icon: TLUiMenuItemProps['icon']
		onSelect: TLUiMenuItemProps['onSelect']
		onDragStart: TLUiMenuItemProps['onDragStart']
		overflow?: boolean
	}
</script>

<script lang="ts">
	import { preventDefault } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import SvelteDrawUiButtonIcon from '../Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiToolbarButton from '../SvelteDrawUiToolbarButton.svelte'
	import { createDraggableToolbarEvents } from './draggableToolbarEvents'

	let {
		id,
		labelStr,
		titleStr,
		disabled,
		isSelected,
		icon,
		onSelect,
		onDragStart,
		overflow,
	}: DraggableToolbarButtonProps = $props()

	const editor = getEditor()
	const events = createDraggableToolbarEvents(
		editor,
		() => onDragStart,
		() => onSelect
	)
</script>

{#if overflow}
	<SvelteDrawUiToolbarButton
		aria-label={labelStr}
		aria-pressed={isSelected ? 'true' : 'false'}
		isActive={isSelected}
		class="tlui-button-grid__button"
		data-testid={`tools.more.${id}`}
		data-value={id}
		{disabled}
		title={titleStr}
		type="icon"
		{...events}
	>
		<SvelteDrawUiButtonIcon icon={icon!} />
	</SvelteDrawUiToolbarButton>
{:else}
	<SvelteDrawUiToolbarButton
		aria-label={labelStr}
		aria-pressed={isSelected ? 'true' : 'false'}
		data-testid={`tools.${id}`}
		data-value={id}
		{disabled}
		ontouchstart={(e: TouchEvent) => {
			preventDefault(e)
			onSelect('toolbar')
		}}
		title={titleStr}
		type="tool"
		{...events}
	>
		<SvelteDrawUiButtonIcon icon={icon!} />
	</SvelteDrawUiToolbarButton>
{/if}
