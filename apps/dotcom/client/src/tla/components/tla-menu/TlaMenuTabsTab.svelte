<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'
	import styles from './menu.module.css'
	import { getTabsContext } from './tabsContext'

	/** `id` is the tab's key (compared with `activeTab`), not the DOM id. */
	let {
		id,
		disabled = false,
		children,
		class: className,
		...props
	}: { id: string; children?: Snippet } & Omit<HTMLButtonAttributes, 'id' | 'children'> = $props()

	const tabs = getTabsContext()
</script>

<button
	class={[styles.menuTabsTab, 'tla-text_ui__medium', className]}
	data-active={tabs.activeTab === id}
	onclick={() => tabs.onTabChange(id)}
	{disabled}
	aria-selected={tabs.activeTab === id}
	aria-controls={`tla-tabpanel-${id}`}
	role="tab"
	{...props}
>
	{@render children?.()}
</button>
