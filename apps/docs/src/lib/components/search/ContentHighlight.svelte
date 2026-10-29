<script lang="ts">
	import type { Hit } from 'instantsearch.js'
	import { chooseHighlights } from '#lib/search/highlights.js'
	import type { SearchEntry } from '#utils/algolia.js'

	let { hit }: { hit: Hit<SearchEntry> } = $props()

	const highlights = $derived(chooseHighlights(hit))
	const first = $derived(highlights.first)
	const second = $derived(highlights.second)
</script>

{#snippet highlightContent(
	parts: { value: string; isHighlighted: boolean }[],
	didTruncateStart: boolean,
	className: string
)}
	<div class={className}>
		{#if didTruncateStart}…{/if}{#each parts as part, index (index)}{#if part.isHighlighted}<mark
					>{part.value}</mark
				>{:else}{part.value}{/if}{/each}
	</div>
{/snippet}

{#if first && !second}
	<!-- if we only have the first item, show it over two lines: -->
	{@render highlightContent(first.parts, first.didTruncateStart, 'line-clamp-2 text-sm')}
{:else}
	<!-- otherwise, show both items on one line each: -->
	{#if first}
		{@render highlightContent(first.parts, first.didTruncateStart, 'line-clamp-1 text-sm')}
	{/if}
	{#if second}
		{@render highlightContent(second.parts, second.didTruncateStart, 'line-clamp-1 text-sm')}
	{/if}
{/if}
