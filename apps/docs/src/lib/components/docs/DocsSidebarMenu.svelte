<script lang="ts">
	import { page } from '$app/state'
	import { APIGroup, type SidebarContentLink } from '#types/content-types.js'
	import { cn } from '#utils/cn.js'
	import DocsSidebarGroup from './DocsSidebarGroup.svelte'

	let {
		title,
		elements,
		isFirst = false,
		hideTitle = false,
	}: {
		isFirst?: boolean
		title: string
		elements: SidebarContentLink[]
		hideTitle?: boolean
	} = $props()

	const pathname = $derived(page.url.pathname)
	const groupIdOf = (e: SidebarContentLink) => ('groupId' in e ? e.groupId : null)
	const groups = $derived(elements.some((e) => groupIdOf(e)) ? Object.values(APIGroup) : null)
</script>

<div class={cn(isFirst ? 'mt-0 md:mt-8' : 'mt-0 md:mt-12')}>
	{#if !hideTitle}
		<h4
			class="text-black dark:text-white uppercase text-xs w-full font-semibold md:sticky top-0 bg-white dark:bg-zinc-950 z-10 py-2"
		>
			{title}
		</h4>
	{/if}
	<ul class={cn('flex flex-col gap-2 text-sm break-words', !hideTitle && 'mt-2')}>
		{#if groups}
			{#each groups as group (group)}
				{@const groupElements = elements.filter((e) => groupIdOf(e) === group)}
				{#if groupElements.length > 0}
					<li>
						<DocsSidebarGroup {group} elements={groupElements} />
					</li>
				{/if}
			{/each}
		{:else}
			{#each elements as { title, url } (url)}
				<li>
					<a
						href={url}
						data-active={pathname === url}
						class={cn(
							'sidebar-link block',
							pathname === url || `/getting-started${pathname}` === url
								? 'text-black dark:text-white font-semibold'
								: 'hover:text-zinc-800 dark:hover:text-zinc-200'
						)}
					>
						{title}
					</a>
				</li>
			{/each}
		{/if}
	</ul>
</div>
