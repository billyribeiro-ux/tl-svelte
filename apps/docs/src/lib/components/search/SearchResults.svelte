<script lang="ts">
	import type { Hit } from 'instantsearch.js'
	import { twJoin } from 'tailwind-merge'
	import { hitHref } from '#lib/search/search.svelte.js'
	import type { SearchEntry } from '#utils/algolia.js'
	import ContentHighlight from './ContentHighlight.svelte'
	import TitleHighlight from './TitleHighlight.svelte'

	let {
		hits,
		activeIndex,
		listId,
		variant,
		onactivate,
	}: {
		hits: Hit<SearchEntry>[]
		activeIndex: number
		listId: string
		variant: 'dialog' | 'page'
		onactivate: (index: number) => void
	} = $props()

	// A section heading is shown whenever the section changes from the previous hit.
	const rows = $derived(
		hits.map((hit, index) => ({
			hit,
			index,
			href: hitHref(hit),
			showChapter: hit.section !== (index > 0 ? hits[index - 1].section : ''),
		}))
	)

	$effect(() => {
		// Keep the keyboard-active item in view, as the ariakit combobox did.
		document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
	})
</script>

{#snippet empty()}
	{#if variant === 'dialog'}
		<div class="text-center py-8 text-zinc-400 dark:text-zinc-600">
			<p>No results found.</p>
			<p class="mt-2">
				Will you tell us what you're looking for on our&#32;<a
					class="text-blue-500 hover:text-blue-600"
					target="_blank"
					href="https://discord.svelte-draw.invalid/?utm_source=blog&utm_medium=search&utm_campaign=no-results-found"
					rel="noreferrer">discord</a
				>?
			</p>
		</div>
	{:else}
		<div class="sticky top-[4.5rem] text-center py-8 text-zinc-400 dark:text-zinc-600">
			No results found.
		</div>
	{/if}
{/snippet}

{#snippet list()}
	<div id={listId} role="listbox" aria-label="Search results">
		{#each rows as row (row.hit.objectID)}
			{#if row.showChapter}
				<div role="presentation" class="text-black dark:text-white font-semibold mt-6 mb-4">
					{row.hit.section}
				</div>
			{/if}
			<!-- Keyboard handling lives on the search input (the combobox); items are for the mouse. -->
			<div
				id="{listId}-option-{row.index}"
				role="option"
				tabindex="-1"
				aria-selected={row.index === activeIndex}
				data-active-item={row.index === activeIndex}
				class={twJoin(
					'px-4 pt-2.5 pb-3 bg-zinc-100 dark:bg-zinc-800 mt-2',
					'rounded-md cursor-pointer data-[active-item=true]:bg-blue-500',
					'dark:data-[active-item=true]:bg-blue-500 data-[active-item=true]:text-blue-200',
					'[&_mark]:bg-transparent [&_mark]:font-bold',
					'[&_mark]:text-black [&_mark]:data-[active-item=true]:text-white',
					'dark:[&_mark]:text-white',
					'[&_.ais-Highlight-nonHighlighted]:data-[active-item=true]:text-white',
					'hover:text-zinc-800 dark:hover:text-zinc-200'
				)}
				onmousemove={() => {
					if (row.index !== activeIndex) onactivate(row.index)
				}}
			>
				<a href={row.href}>
					<TitleHighlight hit={row.hit} />
					<ContentHighlight hit={row.hit} />
				</a>
			</div>
		{/each}
	</div>
{/snippet}

{#if variant === 'dialog'}
	<div
		class={twJoin(
			'max-h-[32rem] overflow-y-auto p-4 pt-0',
			'border-t border-zinc-100 dark:border-zinc-800'
		)}
	>
		{#if hits.length === 0}
			{@render empty()}
		{:else}
			{@render list()}
		{/if}
	</div>
{:else if hits.length === 0}
	{@render empty()}
{:else}
	{@render list()}
{/if}
