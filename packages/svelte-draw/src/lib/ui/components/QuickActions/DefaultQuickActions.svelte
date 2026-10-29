<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiQuickActionsProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import DefaultQuickActionsContent from './DefaultQuickActionsContent.svelte'

	let { children }: TLUiQuickActionsProps = $props()
</script>

<SvelteDrawUiMenuContextProvider type="small-icons" sourceId="quick-actions">
	{#if children}
		{@render children()}
	{:else}
		<DefaultQuickActionsContent />
	{/if}
</SvelteDrawUiMenuContextProvider>
