<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiSelectTriggerProps {
		children: Snippet
		class?: string
		ref?: HTMLButtonElement | null
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import { Select } from 'bits-ui'
	import SvelteDrawUiIcon from './SvelteDrawUiIcon.svelte'

	/**
	 * The trigger button for the select dropdown.
	 *
	 * @public
	 */
	let { children, class: className, ref = $bindable(null) }: TLUiSelectTriggerProps = $props()
</script>

<Select.Trigger bind:ref class={classNames('tlui-button tlui-select__trigger', className)}>
	{@render children()}
	<span class="tlui-select__chevron" aria-hidden="true">
		<SvelteDrawUiIcon icon="chevron-down" label="" small />
	</span>
</Select.Trigger>
