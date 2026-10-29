<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuCheckboxItemProps {
		checked?: boolean
		onSelect?(e: Event): void
		disabled?: boolean
		title: string
		children: Snippet
	}

	const messages = defineMessages({
		uiChecked: { id: 'ui.checked', defaultMessage: 'Checked' },
	})
</script>

<script lang="ts">
	import { DropdownMenu } from 'bits-ui'
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { setDropdownMenuItemChecked } from './dropdownMenuContext'
	import SvelteDrawUiIcon from './SvelteDrawUiIcon.svelte'

	let { children, onSelect, checked, disabled, title }: TLUiDropdownMenuCheckboxItemProps = $props()

	const msg = getTranslation()
	const dir = getDirection()

	setDropdownMenuItemChecked(() => !!checked)
</script>

<!-- closeOnSelect={false} replaces calling preventDefault on the select event: the menu stays open. -->
<DropdownMenu.CheckboxItem
	dir={dir.current}
	class="tlui-button tlui-button__menu tlui-button__checkbox"
	closeOnSelect={false}
	bind:checked={() => !!checked, () => {}}
	onSelect={(e) => onSelect?.(e)}
	{disabled}
	{title}
>
	<div class="tlui-button__checkbox__indicator">
		{#if checked}
			<span data-state="checked" dir={dir.current}>
				<SvelteDrawUiIcon label={msg(messages.uiChecked)} icon="check" small />
			</span>
		{/if}
	</div>
	{@render children()}
</DropdownMenu.CheckboxItem>
