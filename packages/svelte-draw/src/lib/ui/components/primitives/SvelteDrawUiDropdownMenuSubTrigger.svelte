<script lang="ts" module>
	/** @public */
	export interface TLUiDropdownMenuSubTriggerProps {
		label: string
		id?: string
		title?: string
		disabled?: boolean
	}
</script>

<script lang="ts">
	import { DropdownMenu, mergeProps } from 'bits-ui'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from './Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from './Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiButtonLabel from './Button/SvelteDrawUiButtonLabel.svelte'

	let { id, label, title, disabled }: TLUiDropdownMenuSubTriggerProps = $props()
	const dir = getDirection()
</script>

<DropdownMenu.SubTrigger {disabled}>
	{#snippet child({ props })}
		<SvelteDrawUiButton
			type="menu"
			class="tlui-menu__submenu__trigger"
			{...mergeProps(props, { dir: dir.current, 'data-testid': id })}
			{disabled}
			{title}
		>
			<SvelteDrawUiButtonLabel>{label}</SvelteDrawUiButtonLabel>
			<SvelteDrawUiButtonIcon icon={dir.current === 'rtl' ? 'chevron-left' : 'chevron-right'} small />
		</SvelteDrawUiButton>
	{/snippet}
</DropdownMenu.SubTrigger>
