<script lang="ts">
	import SvelteDrawUiLayout, { type TLUiLayoutProps } from './SvelteDrawUiLayout.svelte'

	/**
	 * A column, usually of UI controls like buttons, select dropdown, checkboxes, etc.
	 *
	 * @public
	 */
	let { ref = $bindable(null), ...props }: TLUiLayoutProps = $props()
</script>

<SvelteDrawUiLayout bind:ref orientation="vertical" layoutClassName="tlui-column" {...props} />
