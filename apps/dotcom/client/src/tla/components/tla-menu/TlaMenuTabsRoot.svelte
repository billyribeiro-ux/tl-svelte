<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setTabsContext } from './tabsContext'

	/*
	Primitives for tabs. Structure is:

	<TlaMenuTabsRoot>
		<TlaMenuTabsTabs>
			<TlaMenuTabsTab/>
			...
		</TlaMenuTabsTabs>
		<TlaMenuTabsPage/>
		...
	</TlaMenuTabsRoot>
	*/
	let {
		activeTab,
		onTabChange,
		children,
	}: { activeTab: string; onTabChange(tab: string): void; children?: Snippet } = $props()

	setTabsContext({
		get activeTab() {
			return activeTab
		},
		onTabChange: (tab) => onTabChange(tab),
	})
</script>

{@render children?.()}
