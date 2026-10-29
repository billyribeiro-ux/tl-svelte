<script lang="ts">
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import type { ArticleLinks } from '#types/content-types.js'

	let { links }: { links: ArticleLinks } = $props()
</script>

<section
	class="py-10 mt-12 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-between gap-8"
>
	{#if links.prev}
		<a
			href={links.prev.path!}
			class="group py-2 px-4 -ml-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 flex flex-col items-start gap-0.5"
		>
			<div
				class="flex items-center gap-1 text-xs group-hover:text-black dark:group-hover:text-white"
			>
				<Heroicon name="20/solid/ArrowLongLeft" class="h-3" />
				<span>Prev</span>
			</div>
			<span class="text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
				{links.prev.title}
			</span>
		</a>
	{:else}
		<span></span>
	{/if}
	{#if links.next}
		<a
			href={links.next.path!}
			class="group py-2 px-4 -mr-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 flex flex-col items-end gap-0.5 justify-self-end ml-auto"
		>
			<div
				class="flex items-center gap-1 text-xs group-hover:text-black dark:group-hover:text-white"
			>
				<span>Next</span>
				<Heroicon name="20/solid/ArrowLongRight" class="h-3" />
			</div>
			<span class="text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
				{links.next.title}
			</span>
		</a>
	{:else}
		<span></span>
	{/if}
</section>
