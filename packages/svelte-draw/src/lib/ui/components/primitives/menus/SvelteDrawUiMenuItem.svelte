<script lang="ts" module>
	import type { TLPointerEventInfo } from '@svelte-draw/editor'
	import type { TLUiEventSource } from '../../../context'
	import type { TLUiIconJsx } from '../SvelteDrawUiIcon.svelte'

	/** @public */
	export interface TLUiMenuItemProps<
		TranslationKey extends string = string,
		IconType extends string = string,
	> {
		id: string
		/**
		 * The icon to display on the item. Icons are only shown in certain menu types.
		 */
		icon?: IconType | TLUiIconJsx
		/**
		 * An icon to display to the left of the menu item.
		 */
		iconLeft?: IconType | TLUiIconJsx
		/**
		 * The keyboard shortcut to display on the item.
		 */
		kbd?: string
		/**
		 * The label to display on the item. If it's a string, it will be translated. If it's an object, the keys will be used as the language keys and the values will be translated.
		 */
		label?: TranslationKey | { [key: string]: TranslationKey }
		/**
		 * If the editor is in readonly mode and the item is not marked as readonlyok, it will not be rendered.
		 */
		readonlyOk?: boolean
		/**
		 * The function to call when the item is clicked.
		 */
		onSelect(source: TLUiEventSource): Promise<void> | void
		/**
		 * Whether this item should be disabled.
		 */
		disabled?: boolean
		/**
		 * Prevent the menu from closing when the item is clicked
		 */
		noClose?: boolean
		/**
		 * Whether to show a spinner on the item.
		 */
		spinner?: boolean
		/**
		 * Whether the item is selected.
		 */
		isSelected?: boolean
		/**
		 * The function to call when the item is dragged. If this is provided, the item will be draggable.
		 */
		onDragStart?(source: TLUiEventSource, info: TLPointerEventInfo): void
	}
</script>

<script lang="ts" generics="TranslationKey extends string = string, IconType extends string = string">
	import { exhaustiveSwitchError, preventDefault } from '@svelte-draw/editor'
	import { ContextMenu, mergeProps } from 'bits-ui'
	import { getDirection, getTranslation } from '../../../hooks/useTranslation/useTranslation.svelte'
	import { unwrapLabel } from '../../../context'
	import { createReadonly } from '../../../hooks'
	import type { TLUiTranslationKey } from '../../../hooks/useTranslation/TLUiTranslationKey'
	import { kbdStr } from '../../../kbd-utils'
	import Spinner from '../../Spinner.svelte'
	import SvelteDrawUiButton from '../Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiButtonLabel from '../Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiDropdownMenuItem from '../SvelteDrawUiDropdownMenuItem.svelte'
	import SvelteDrawUiKbd from '../SvelteDrawUiKbd.svelte'
	import SvelteDrawUiToolbarButton from '../SvelteDrawUiToolbarButton.svelte'
	import DraggableToolbarButton from './DraggableToolbarButton.svelte'
	import { getSvelteDrawUiMenuContext } from './SvelteDrawUiMenuContext'

	let {
		disabled = false,
		spinner = false,
		readonlyOk = false,
		id,
		kbd,
		label,
		icon,
		iconLeft,
		onSelect,
		noClose,
		isSelected,
		onDragStart,
	}: TLUiMenuItemProps<TranslationKey, IconType> = $props()

	const menu = getSvelteDrawUiMenuContext()
	const msg = getTranslation()
	const dir = getDirection()
	const isReadonlyMode = createReadonly()

	const labelToUse = $derived(unwrapLabel(label, menu.type))
	const kbdToUse = $derived(kbd ? kbdStr(kbd) : undefined)
	const labelStr = $derived(labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined)
	const titleStr = $derived(labelStr && kbdToUse ? `${labelStr} ${kbdToUse}` : labelStr)
	const testId = $derived(`${menu.sourceId}.${id}`)

	// A missing shortcut makes the item unlisted in the keyboard shortcuts dialog.
	$effect(() => {
		if (menu.type === 'keyboard-shortcuts' && !kbd && !(isReadonlyMode.current && !readonlyOk)) {
			console.warn(
				`Menu item '${String(label)}' isn't shown in the keyboard shortcuts dialog because it doesn't have a keyboard shortcut.`
			)
		}
	})

	// The type is checked exhaustively below, mirroring the React `switch`.
	function assertNever(type: never): never {
		throw exhaustiveSwitchError(type)
	}
</script>

{#snippet menuButton(extraProps: Record<string, unknown>)}
	<SvelteDrawUiButton
		type="menu"
		data-testid={testId}
		{disabled}
		{...mergeProps(extraProps, {
			onclick: (e: MouseEvent) => {
				if (noClose) preventDefault(e)
				onSelect(menu.sourceId)
			},
		})}
	>
		{#if iconLeft}<SvelteDrawUiButtonIcon icon={iconLeft} small />{/if}
		<SvelteDrawUiButtonLabel>{labelStr}</SvelteDrawUiButtonLabel>
		{#if kbd}<SvelteDrawUiKbd keys={kbd} />{/if}
	</SvelteDrawUiButton>
{/snippet}

<!-- If the editor is in readonly mode and the item is not marked as readonlyok, render nothing -->
{#if !(isReadonlyMode.current && !readonlyOk)}
	{#if menu.type === 'menu'}
		<SvelteDrawUiDropdownMenuItem {noClose}>
			{#snippet child({ props })}
				{@render menuButton(props)}
			{/snippet}
		</SvelteDrawUiDropdownMenuItem>
	{:else if menu.type === 'context-menu'}
		<!-- Hide disabled context menu items -->
		{#if !disabled}
			<ContextMenu.Item
				dir={dir.current}
				draggable={false}
				class="tlui-button tlui-button__menu"
				data-testid={testId}
				closeOnSelect={!noClose}
				onpointerup={(e: PointerEvent) => {
					// Prevent right-click pointerup from triggering item selection.
					// Radix calls click() on pointerup when the pointer wasn't pressed
					// on the item, but doesn't check the button — so a right-click
					// release while moving across the menu selects the item under the cursor.
					if (e.button !== 0) {
						preventDefault(e)
					}
				}}
				onSelect={() => {
					onSelect(menu.sourceId)
				}}
			>
				<span class="tlui-button__label" draggable={false}>
					{labelStr}
				</span>
				{#if iconLeft}<SvelteDrawUiButtonIcon icon={iconLeft} small />{/if}
				{#if kbd}<SvelteDrawUiKbd keys={kbd} />{/if}
				{#if spinner}<Spinner />{/if}
			</ContextMenu.Item>
		{/if}
	{:else if menu.type === 'small-icons' || menu.type === 'icons'}
		<SvelteDrawUiToolbarButton
			aria-pressed={isSelected === undefined ? undefined : isSelected ? 'true' : 'false'}
			data-testid={testId}

			isActive={isSelected}
			type="icon"
			title={titleStr}
			{disabled}
			onclick={() => onSelect(menu.sourceId)}
		>
			<SvelteDrawUiButtonIcon icon={icon!} small />
		</SvelteDrawUiToolbarButton>
	{:else if menu.type === 'keyboard-shortcuts'}
		{#if kbd}
			<div class="tlui-shortcuts-dialog__key-pair" data-testid={testId}>
				<div class="tlui-shortcuts-dialog__key-pair__key">{labelStr}</div>
				<div class="tlui-shortcuts-dialog__key-pair__value">
					<SvelteDrawUiKbd keys={kbd} visibleOnMobileLayout />
				</div>
			</div>
		{/if}
	{:else if menu.type === 'helper-buttons'}
		<SvelteDrawUiButton
			type="low"
			data-testid={testId}
			{disabled}
			onclick={() => onSelect(menu.sourceId)}
		>
			<SvelteDrawUiButtonIcon icon={icon!} />
			<SvelteDrawUiButtonLabel>{labelStr}</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{:else if menu.type === 'toolbar'}
		{#if onDragStart}
			<DraggableToolbarButton
				{id}
				{icon}
				{onSelect}
				{onDragStart}
				{labelStr}
				{titleStr}
				{disabled}
				{isSelected}
			/>
		{:else}
			<SvelteDrawUiToolbarButton
				aria-label={labelStr}
				aria-pressed={isSelected ? 'true' : 'false'}
				data-testid={`tools.${id}`}
				data-value={id}
				{disabled}
				onclick={() => onSelect('toolbar')}
				ontouchstart={(e: TouchEvent) => {
					preventDefault(e)
					onSelect('toolbar')
				}}
				title={titleStr}
				type="tool"
			>
				<SvelteDrawUiButtonIcon icon={icon!} />
			</SvelteDrawUiToolbarButton>
		{/if}
	{:else if menu.type === 'toolbar-overflow'}
		{#if onDragStart}
			<DraggableToolbarButton
				{id}
				{icon}
				{onSelect}
				{onDragStart}
				{labelStr}
				{titleStr}
				{disabled}
				{isSelected}
				overflow
			/>
		{:else}
			<SvelteDrawUiToolbarButton
				aria-label={labelStr}
				aria-pressed={isSelected ? 'true' : 'false'}
				isActive={isSelected}
				data-testid={`tools.more.${id}`}
				data-value={id}
				{disabled}
				onclick={() => onSelect('toolbar')}
				title={titleStr}
				type="icon"
			>
				<SvelteDrawUiButtonIcon icon={icon!} />
			</SvelteDrawUiToolbarButton>
		{/if}
	{:else}
		{assertNever(menu.type)}
	{/if}
{/if}
