<script lang="ts">
	import { page } from '$app/state'
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import type { SidebarContentLink } from '#types/content-types.js'
	import DocsCategoryMenu from './DocsCategoryMenu.svelte'
	import DocsSidebarMenu from './DocsSidebarMenu.svelte'
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

	// Open for one page only: remembering where it was opened closes it when the page changes
	// (choosing a link in the panel navigates).
	let openedOn = $state<string | null>(null)
	const open = $derived(openedOn === page.url.pathname)
	const setOpen = (value: boolean) => (openedOn = value ? page.url.pathname : null)
	let root: HTMLDivElement | undefined = $state()
	const panelId = $props.id()

	// headlessui's Popover closed on outside click and Escape.

	function onWindowClick(e: MouseEvent) {
		if (open && root && e.target instanceof Node && !root.contains(e.target)) setOpen(false)
	}

	function onWindowKeyDown(e: KeyboardEvent) {
		if (open && e.key === 'Escape') setOpen(false)
	}
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeyDown} />

<!-- `data-open` on the root is what the `group-data-[open]/popover` classes below key on. -->
<div bind:this={root} class="group/popover h-full grow" data-open={open ? '' : undefined}>
	<button
		type="button"
		class="group/button focus:outline-none h-full w-full flex justify-start items-center"
		aria-expanded={open}
		aria-controls={panelId}
		onclick={() => (setOpen(!open))}
	>
		<div
			class="flex gap-2 h-8 px-2 -ml-2 items-center justify-center rounded group-focus/button:outline-none group-focus/button:bg-zinc-100 dark:group-focus/button:bg-zinc-800 text-black dark:text-white font-semibold"
		>
			<Heroicon name="16/solid/Bars3" class="h-4 shrink-0 group-data-[open]/popover:hidden" />
			<Heroicon
				name="20/solid/XMark"
				class="h-4 scale-125 shrink-0 hidden group-data-[open]/popover:block"
			/>
			<span class="text-sm">Menu</span>
		</div>
	</button>
	{#if open}
		<div id={panelId}>
			<div
				class="fixed left-0 top-12 bg-white dark:bg-zinc-950 w-screen px-5 py-8 overflow-y-auto z-10"
				style="height: calc(100vh - 6.5rem)"
			>
				<DocsCategoryMenu />
				{#each elements as menu, index (menu.url)}
					<DocsSidebarMenu
						title={menu.title}
						elements={'children' in menu ? menu.children : []}
						isFirst={index === 0}
						hideTitle={elements.length === 1}
					/>
				{/each}
			</div>
		</div>
	{/if}
</div>
