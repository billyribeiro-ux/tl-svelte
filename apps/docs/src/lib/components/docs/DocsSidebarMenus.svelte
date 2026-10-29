<script lang="ts" module>
	// Remembered across navigations so the sidebar keeps its scroll position.
	let scrollPosition = 0
</script>

<script lang="ts">
	import { page } from '$app/state'
	import type { SidebarContentLink } from '#types/content-types.js'
	import DocsSidebarMenu from './DocsSidebarMenu.svelte'

	let { menus }: { menus: SidebarContentLink[] } = $props()

	let container: HTMLDivElement | undefined = $state()

	$effect(() => {
		void page.url.pathname
		container?.scrollTo(0, scrollPosition)
		const elements = document.querySelectorAll<HTMLElement>('.sidebar-link[data-active=true]')
		for (const element of elements) {
			const aboveView = container && element.offsetTop < container.scrollTop
			const belowView =
				container && element.offsetTop > container.scrollTop + container.clientHeight
			if (!aboveView && !belowView) {
				return
			}
		}
		const element = elements[0]
		element?.scrollIntoView({ block: 'center' })
	})

	function onScroll(e: Event) {
		e.stopPropagation()
		scrollPosition = container?.scrollTop ?? 0
	}
</script>

<div
	bind:this={container}
	onscroll={onScroll}
	class="relative pr-12 overflow-y-auto grow min-h-0 pb-24"
>
	<div>
		{#each menus as menu, index (menu.url)}
			<DocsSidebarMenu
				title={menu.title}
				elements={'children' in menu ? menu.children : []}
				isFirst={index === 0}
				hideTitle={menus.length === 1}
			/>
		{/each}
	</div>
</div>
