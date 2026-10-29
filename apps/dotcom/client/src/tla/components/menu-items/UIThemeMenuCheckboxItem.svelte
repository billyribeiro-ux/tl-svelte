<script lang="ts">
	import { DropdownMenu } from 'bits-ui'
	import { getDirection, getTranslation, SvelteDrawUiIcon } from 'svelte-draw'

	let {
		checked,
		label,
		onPreview,
		onSelect,
	}: {
		checked: boolean
		label: string
		onPreview(): void
		onSelect(): void
	} = $props()

	const dir = getDirection()
	const msg = getTranslation()
</script>

<!-- closeOnSelect={false} replaces calling preventDefault on the select event: the menu stays open. -->
<DropdownMenu.CheckboxItem
	dir={dir.current}
	class="tlui-button tlui-button__menu tlui-button__checkbox"
	title={label}
	closeOnSelect={false}
	bind:checked={() => checked, () => {}}
	onpointerenter={(e) => {
		if (e.pointerType !== 'touch') onPreview()
	}}
	onSelect={() => onSelect()}
>
	<SvelteDrawUiIcon
		small
		label={msg(checked ? 'ui.checked' : 'ui.unchecked')}
		icon={checked ? 'check' : 'none'}
	/>
	<span class="tlui-button__label" draggable={false}>
		{label}
	</span>
</DropdownMenu.CheckboxItem>
