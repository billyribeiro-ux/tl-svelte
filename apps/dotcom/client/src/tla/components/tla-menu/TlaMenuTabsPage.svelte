<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'
	import { getTabsContext } from './tabsContext'

	/** `id` is the tab's key (compared with `activeTab`); the DOM id is `tla-tabpanel-${id}`. */
	let {
		id,
		children,
		...props
	}: { id: string; children?: Snippet } & Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'children'> =
		$props()

	const tabs = getTabsContext()
</script>

{#if tabs.activeTab === id}
	<div id={`tla-tabpanel-${id}`} role="tabpanel" {...props}>
		{@render children?.()}
	</div>
{/if}
