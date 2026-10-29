<script lang="ts" module>
	import type { TLUiIconType } from '../../icon-types'

	/** @public */
	export interface TLUiSelectItemProps {
		value: string
		label: string
		icon?: TLUiIconType | Exclude<string, TLUiIconType>
		disabled?: boolean
		class?: string
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import { Select } from 'bits-ui'
	import SvelteDrawUiIcon from './SvelteDrawUiIcon.svelte'

	/**
	 * An item in the select dropdown. Styled to match SvelteDrawUiMenuCheckboxItem.
	 *
	 * @public
	 */
	let { value, label, icon, disabled, class: className }: TLUiSelectItemProps = $props()
</script>

<Select.Item {value} {label} {disabled}>
	{#snippet child({ props, selected })}
		<!-- bits-ui exposes `data-selected`; ui.css targets Radix's `data-state="checked"`, so it is added here. -->
		<div
			{...props}
			data-state={selected ? 'checked' : 'unchecked'}
			class={classNames(
				'tlui-button tlui-button__menu tlui-button__checkbox tlui-select__item',
				className
			)}
		>
			<SvelteDrawUiIcon small icon="check" label="" class="tlui-select__item-indicator" />
			{#if icon}<SvelteDrawUiIcon {icon} label="" small />{/if}
			<span class="tlui-button__label">{label}</span>
		</div>
	{/snippet}
</Select.Item>
