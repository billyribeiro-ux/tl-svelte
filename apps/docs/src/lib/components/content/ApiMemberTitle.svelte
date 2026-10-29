<script lang="ts">
	import type { Snippet } from 'svelte'
	import { cn } from '#utils/cn.js'
	import Heroicon from '#lib/components/common/Heroicon.svelte'

	let {
		children,
		source,
		tags,
		inherited,
		large,
	}: {
		children?: Snippet
		source?: string | null
		large?: boolean
		tags?: string[]
		inherited?: { name: string; link: string }
	} = $props()
</script>

<div class="flex items-end gap-2 prose-headings:mb-0">
	{@render children?.()}
	<div class={cn('flex gap-2 items-center pb-1.5', !large && 'ml-auto')}>
		{#each tags ?? [] as tag (tag)}
			<span class="border border-zinc-800 rounded-full px-1.5 text-xs">{tag}</span>
		{/each}
		{#if source}
			<a href={source} target="_blank" rel="noopener noreferrer" title="Source code">
				<Heroicon name="20/solid/CodeBracket" class="size-20" />
			</a>
		{/if}
	</div>
</div>
{#if inherited}
	<div class="not-prose text-xs mb-6">
		from{' '}
		<a
			href={inherited.link}
			class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center"
		>
			<span>{inherited.name}</span>
			<Heroicon name="16/solid/ArrowRight" class="h-3 -rotate-45" />
		</a>
	</div>
{/if}
