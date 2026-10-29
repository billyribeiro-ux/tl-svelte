<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { TLUiEventSource } from '../../../context'
	import type { TLUiIconJsx } from '../SvelteDrawUiIcon.svelte'

	/** @public */
	export interface TLUiMenuCheckboxItemProps<
		TranslationKey extends string = string,
		IconType extends string = string,
	> {
		icon?: IconType | TLUiIconJsx
		id: string
		kbd?: string
		title?: string
		label?: TranslationKey | { [key: string]: TranslationKey }
		lang?: string
		readonlyOk?: boolean
		onSelect(source: TLUiEventSource): Promise<void> | void
		toggle?: boolean
		checked?: boolean
		disabled?: boolean
	}

	const messages = defineMessages({
		uiChecked: { id: 'ui.checked', defaultMessage: 'Checked' },
		uiUnchecked: { id: 'ui.unchecked', defaultMessage: 'Unchecked' },
	})
</script>

<script lang="ts" generics="TranslationKey extends string = string, IconType extends string = string">
	import { preventDefault } from '@svelte-draw/editor'
	import { ContextMenu, DropdownMenu } from 'bits-ui'
	import { getDirection, getTranslation } from '../../../hooks/useTranslation/useTranslation.svelte'
	import { unwrapLabel } from '../../../context'
	import { createReadonly } from '../../../hooks'
	import type { TLUiTranslationKey } from '../../../hooks/useTranslation/TLUiTranslationKey'
	import SvelteDrawUiIcon from '../SvelteDrawUiIcon.svelte'
	import SvelteDrawUiKbd from '../SvelteDrawUiKbd.svelte'
	import { getSvelteDrawUiMenuContext } from './SvelteDrawUiMenuContext'

	let {
		kbd,
		label,
		lang,
		readonlyOk,
		onSelect,
		toggle = false,
		disabled = false,
		checked = false,
	}: TLUiMenuCheckboxItemProps<TranslationKey, IconType> = $props()

	const menu = getSvelteDrawUiMenuContext()
	const isReadonlyMode = createReadonly()
	const msg = getTranslation()
	const dir = getDirection()

	const labelToUse = $derived(unwrapLabel(label, menu.type))
	const labelStr = $derived(labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined)

	function handleSelect(e: Event) {
		onSelect(menu.sourceId)
		preventDefault(e)
	}
</script>

{#snippet content()}
	<SvelteDrawUiIcon
		small
		label={msg(checked ? messages.uiChecked : messages.uiUnchecked)}
		icon={toggle ? (checked ? 'toggle-on' : 'toggle-off') : checked ? 'check' : 'none'}
	/>
	{#if labelStr}
		<span class="tlui-button__label" draggable={false}>
			{labelStr}
		</span>
	{/if}
	{#if kbd}<SvelteDrawUiKbd keys={kbd} />{/if}
{/snippet}

<!-- If the editor is in readonly mode and the item is not marked as readonlyok, render nothing -->
{#if !(isReadonlyMode.current && !readonlyOk)}
	{#if menu.type === 'menu'}
		<!-- closeOnSelect={false} replaces preventDefault(): checkbox items never close the menu. -->
		<DropdownMenu.CheckboxItem
			dir={dir.current}
			{lang}
			class="tlui-button tlui-button__menu tlui-button__checkbox"
			closeOnSelect={false}
			onSelect={handleSelect}
			{disabled}
			bind:checked={() => checked, () => {}}
		>
			{@render content()}
		</DropdownMenu.CheckboxItem>
	{:else if menu.type === 'context-menu'}
		<ContextMenu.CheckboxItem
			dir={dir.current}
			{lang}
			class="tlui-button tlui-button__menu tlui-button__checkbox"
			closeOnSelect={false}
			onSelect={handleSelect}
			{disabled}
			bind:checked={() => checked, () => {}}
		>
			{@render content()}
		</ContextMenu.CheckboxItem>
	{/if}
	<!-- no checkbox items in actions menu -->
{/if}
