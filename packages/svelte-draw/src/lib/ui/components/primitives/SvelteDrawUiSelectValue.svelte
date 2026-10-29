<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { TLUiIconType } from '../../icon-types'

	/** @public */
	export interface TLUiSelectValueProps {
		placeholder?: string
		icon?: TLUiIconType | Exclude<string, TLUiIconType>
		children?: Snippet
	}
</script>

<script lang="ts">
	import { Select } from 'bits-ui'
	import { getSelectContext } from './selectContext'
	import SvelteDrawUiIcon from './SvelteDrawUiIcon.svelte'

	/**
	 * Displays the currently selected value in the trigger.
	 *
	 * @public
	 */
	let { placeholder, icon, children: contentSnippet }: TLUiSelectValueProps = $props()

	const select = getSelectContext()
	// Like Radix, show the placeholder only while the select has no value.
	const showPlaceholder = $derived(select !== undefined && select.value === '')
</script>

<Select.Value {placeholder}>
		{#if showPlaceholder}
			{placeholder}
		{:else}
			<span class="tlui-select__value">
				{#if icon}<SvelteDrawUiIcon {icon} label="" small />{/if}
				<span class="tlui-button__label">{@render contentSnippet?.()}</span>
			</span>
		{/if}
</Select.Value>
