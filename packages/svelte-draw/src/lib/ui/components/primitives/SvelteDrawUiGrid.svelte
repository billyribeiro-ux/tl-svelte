<script lang="ts">
	import SvelteDrawUiLayout, { type TLUiLayoutProps } from './SvelteDrawUiLayout.svelte'

	/**
	 * A tight grid 4 elements wide, usually of UI controls like buttons, select dropdown, checkboxes, etc.
	 *
	 * @public
	 */
	let { ref = $bindable(null), ...props }: TLUiLayoutProps = $props()
</script>

<SvelteDrawUiLayout bind:ref orientation="horizontal" layoutClassName="tlui-grid" {...props} />
