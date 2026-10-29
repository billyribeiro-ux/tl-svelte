<script lang="ts">
	import { onMount } from 'svelte'
	import { browser } from '$app/env'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import { SearchSession, hitHref } from '#lib/search/search.svelte.js'
	import SearchResults from './SearchResults.svelte'

	let { indexName }: { indexName: 'docs' | 'blog' } = $props()

	// svelte-ignore state_referenced_locally
	const session = new SearchSession(indexName, { distinct: 4, hitsPerPage: 40 })
	const listId = $props.id()

	let open = $state(true)
	// The active (keyboard/hover) result; it belongs to one set of hits and resets when new ones arrive.
	let active = $state.raw<{ hits: unknown; index: number }>({ hits: null, index: -1 })
	const activeIndex = $derived(active.hits === session.hits ? active.index : -1)
	const setActive = (index: number) => (active = { hits: session.hits, index })
	let input: HTMLInputElement | undefined = $state()

	// The page is prerendered (Next rendered /search per request), where `url.searchParams` is
	// unavailable; the query is read in the browser only.
	const urlQuery = $derived(browser ? page.url.searchParams.get('query') || '' : '')
	const capitalizedIndexName = $derived(indexName.charAt(0).toUpperCase() + indexName.slice(1))

	// Search for the query in the URL whenever it changes (the initial value included).
	$effect(() => {
		void session.refine(urlQuery)
	})

	onMount(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				input?.focus()
				input?.setSelectionRange(0, input.value.length)
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	})

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		setActive(-1)
		session.refineDebounced(event.currentTarget.value)
	}

	function handleKeyDown(e: KeyboardEvent) {
		const count = session.hits.length
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setActive(Math.min(activeIndex + 1, count - 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setActive(Math.max(activeIndex - 1, -1))
		} else if (e.key === 'Enter') {
			const hit = activeIndex >= 0 ? session.hits[activeIndex] : undefined
			if (hit) {
				open = false
				void goto(hitHref(hit))
				return
			}
			const queryParam = input?.value || ''
			void goto(`${page.url.pathname}?query=${encodeURIComponent(queryParam.trim())}`)
		}
	}
</script>

{#if open}
	<div class="w-full mb-12 h-full">
		<div class="pointer-events-auto min-h-full">
			<div
				class="md:sticky bg-white dark:bg-zinc-950 w-full md:top-4 flex items-center z-20 md:pb-4"
			>
				<div
					class="flex h-10 grow items-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 focus-within:ring-blue-500 focus-within:ring-2 min-w-full"
				>
					<Heroicon name="20/solid/MagnifyingGlass" class="h-4 shrink-0 text-black dark:text-white" />
					<input
						bind:this={input}
						class="h-full w-full mr-4 focus:outline-none text-black dark:text-white bg-transparent"
						type="text"
						role="combobox"
						aria-expanded="true"
						aria-controls={listId}
						aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
						aria-autocomplete="list"
						autocomplete="off"
						placeholder={`Search ${capitalizedIndexName}...`}
						value={urlQuery}
						oninput={handleInput}
						onkeydown={handleKeyDown}
					/>
				</div>
			</div>
			<SearchResults
				hits={session.hits}
				{activeIndex}
				{listId}
				variant="page"
				onactivate={setActive}
			/>
		</div>
	</div>
{/if}
