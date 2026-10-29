<script lang="ts">
	import { getHighlightParts } from './search.js'

	let { text, searchTerms }: { text: string; searchTerms: string[] } = $props()

	const parts = $derived(getHighlightParts(text, searchTerms))
</script>

{#if !parts.some((part) => part.match)}{text}{:else}{#each parts as part, i (i)}{#if part.match}<strong
				class="examples__sidebar__item__title__match">{part.text}</strong
			>{:else}{part.text}{/if}{/each}{/if}
