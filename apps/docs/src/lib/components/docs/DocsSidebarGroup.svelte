<script lang="ts">
	import { page } from '$app/state'
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import { cn } from '#utils/cn.js'

	let {
		group,
		elements,
	}: { group: string; elements: { title: string; url: string }[] } = $props()

	// Like headlessui's `<Disclosure defaultOpen>`: open at first if it holds the current page.
	// svelte-ignore state_referenced_locally
	let open = $state(elements.some((e) => e.url === page.url.pathname))
	const panelId = $props.id()
</script>

<!-- `data-open` is the hook the `group-data-[open]` classes key on (headlessui set it too). -->
<button
	type="button"
	class="group w-full flex justify-between gap-4"
	data-open={open ? '' : undefined}
	aria-expanded={open}
	aria-controls={panelId}
	onclick={() => (open = !open)}
>
	<span
		class="group-data-[open]:text-black dark:group-data-[open]:text-white group-data-[open]:font-semibold"
	>
		{group}
	</span>
	<Heroicon
		name="16/solid/ChevronRight"
		class="h-3.5 shrink-0 group-data-[open]:rotate-90 text-zinc-400 dark:text-zinc-600 group-data-[open]:text-black dark:group-data-[open]:text-white"
	/>
</button>
{#if open}
	<div id={panelId}>
		<ul class="flex flex-col gap-2 ml-1 pl-2 pt-2 border-l border-zinc-100 dark:border-zinc-800">
			{#each elements as { title, url } (url)}
				<li>
					<a
						href={url}
						data-active={page.url.pathname === url}
						class={cn(
							'sidebar-link w-full truncate',
							page.url.pathname === url
								? 'text-black dark:text-white font-semibold'
								: 'hover:text-zinc-800 dark:hover:text-zinc-200'
						)}
					>
						{title}
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
