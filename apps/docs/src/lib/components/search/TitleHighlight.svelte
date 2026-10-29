<script lang="ts">
	import type { Hit } from 'instantsearch.js'
	import { getTitleParts } from '#lib/search/highlights.js'
	import type { SearchEntry } from '#utils/algolia.js'

	// Same markup react-instantsearch's <Highlight attribute="title"> rendered; the result item styles
	// target `.ais-Highlight-nonHighlighted`.
	let { hit }: { hit: Hit<SearchEntry> } = $props()

	const parts = $derived(getTitleParts(hit))
</script>

<span class="ais-Highlight"
	>{#each parts as part, index (index)}{#if part.isHighlighted}<mark class="ais-Highlight-highlighted"
				>{part.value}</mark
			>{:else}<span class="ais-Highlight-nonHighlighted">{part.value}</span>{/if}{/each}</span
>
