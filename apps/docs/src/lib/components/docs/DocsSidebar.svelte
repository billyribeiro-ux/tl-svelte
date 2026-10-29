<script lang="ts">
	import Navigation from '#lib/components/common/Navigation.svelte'
	import type { SidebarContentLink } from '#types/content-types.js'
	import DocsCategoryMenu from './DocsCategoryMenu.svelte'
	import DocsSidebarMenus from './DocsSidebarMenus.svelte'
	import { processSidebarContent } from './docs-sidebar-utils'

	let {
		links,
		sectionId,
		categoryId,
		articleId,
	}: {
		links: SidebarContentLink[]
		sectionId?: string
		categoryId?: string
		articleId?: string
	} = $props()

	const elements = $derived(
		processSidebarContent(
			{
				sectionId: sectionId ?? null,
				categoryId: categoryId ?? null,
				articleId: articleId ?? null,
				links,
			},
			sectionId
		)
	)
</script>

<Navigation class="hidden md:flex">
	<DocsCategoryMenu />
	<DocsSidebarMenus menus={elements} />
</Navigation>
