<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount, type Snippet } from 'svelte'
	import svelteDrawSdkLogoLight from '../../../assets/svelte-draw_sdk_logo_light.png'
	import { examples, type Example } from '#lib/examples.js'
	import ExampleInfoDialog from '#lib/ExampleInfoDialog.svelte'
	import ExampleSidebarListItem from '#lib/ExampleSidebarListItem.svelte'
	import { exampleMatchesSearch, getSearchTerms } from '#lib/search.js'
	import SidebarIcon from '#lib/SidebarIcon.svelte'

	let { example, children }: { example: Example; children: Snippet } = $props()

	const categories = examples.map((e) => e.id)
	let filterValue = $state('')
	let dialogExample = $state.raw<Example | null>(null)

	const searchTerms = $derived(getSearchTerms(filterValue))
	const isSearching = $derived(filterValue.trim().length > 0)
	const hasResults = $derived(
		examples.some((category) =>
			category.value.some((example) => exampleMatchesSearch(example, searchTerms))
		)
	)

	// The filter is mirrored into the url as `/?filter=...` (whichever example is open) without
	// navigating, so the shallow, focus-preserving `goto` replaces `history.replaceState`.
	function replaceUrl(url: string) {
		void goto(url, { shallow: true, replace: true, reset: false })
	}

	function handleFilterInput(e: Event & { currentTarget: HTMLInputElement }) {
		filterValue = e.currentTarget.value
		replaceUrl(e.currentTarget.value ? `/?filter=${encodeURIComponent(e.currentTarget.value)}` : '/')
	}

	function handleClearFilter() {
		filterValue = ''
		replaceUrl('/')
	}

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const filter = urlParams.get('filter')
		if (filter) {
			filterValue = decodeURIComponent(filter)
		}
	})
</script>

<div class="example">
	<nav class="example__sidebar scroll-light">
		<div class="example__sidebar__top">
			<div class="example__sidebar__header">
				<a class="example__sidebar__header__logo" href="/" aria-label="svelte-draw examples">
					<img
						class="examples__svelte-draw__logo"
						src={svelteDrawSdkLogoLight}
						alt="svelte-draw SDK"
						draggable={false}
					/>
				</a>
				<span class="example__sidebar__header-title">Examples</span>
				<a
					href="{example.path}/full"
					class="example__sidebar__item__button hoverable hoverable__small"
					aria-label="Collapse sidebar"
					title="Collapse sidebar"
				>
					<SidebarIcon name="collapse" />
				</a>
			</div>
			<div class="example__sidebar__section">
				<label class="example__sidebar__search hoverable">
					<SidebarIcon name="search" />
					<input
						class="example__sidebar__filter"
						id="example-sidebar-filter"
						name="filter"
						aria-label="Search examples"
						placeholder="Search..."
						value={filterValue}
						oninput={handleFilterInput}
					/>
					{#if filterValue.length > 0}
						<button
							type="button"
							class="example__sidebar__search__clear"
							onclick={handleClearFilter}
							title="Clear search"
							aria-label="Clear search"
						>
							<SidebarIcon name="close" />
						</button>
					{/if}
				</label>
				<!-- a plain full-page load, like the anchors in the React app -->
				<a class="example__sidebar__action-row hoverable" href="/develop" data-sveltekit-reload>
					<SidebarIcon name="code" />
					<span>Develop</span>
				</a>
			</div>
			<div class="example__sidebar__divider"></div>
		</div>
		<ul class="example__sidebar__categories">
			{#each categories as currentCategory (currentCategory)}
				<li class="example__sidebar__category">
					<h3 class="example__sidebar__category__header">{currentCategory}</h3>
					<ul class="example__sidebar__category__items">
						{#each examples
							.find((category) => category.id === currentCategory)
							?.value.filter((example) => exampleMatchesSearch(example, searchTerms)) ?? [] as sidebarExample (sidebarExample.path)}
							<ExampleSidebarListItem
								example={sidebarExample}
								isActive={sidebarExample.path === example.path}
								{searchTerms}
								onInfo={(info) => (dialogExample = info)}
							/>
						{/each}
					</ul>
				</li>
			{/each}
			{#if isSearching && !hasResults}
				<li class="example__sidebar__search-empty">No examples found</li>
			{/if}
			{#if isSearching}
				<!-- The same section wrapper as the action rows above, so the
				     button gets the same full width and vertical rhythm. The gap
				     above comes from the categories' own bottom margin. -->
				<li class="example__sidebar__section">
					<button
						type="button"
						class="example__sidebar__action-row hoverable"
						onclick={handleClearFilter}
					>
						<span>Clear search</span>
					</button>
				</li>
			{/if}
		</ul>
		<div class="example__sidebar__footer-links">
			<a class="example__sidebar__footer-link hoverable" href="/develop" data-sveltekit-reload>
				<SidebarIcon name="code" />
				<span>Build with the svelte-draw SDK</span>
			</a>
			<a
				class="example__sidebar__footer-link hoverable hoverable__small"
				target="_blank"
				rel="noopener noreferrer"
				href="https://github.com/billyribeiro-ux/tl-svelte/issues/new?assignees=&labels=Example%20Request&projects=&template=example_request.yml&title=%5BExample Request%5D%3A+"
			>
				<SidebarIcon name="request" />
				<span>Request an example</span>
			</a>
			<a
				class="example__sidebar__footer-link hoverable hoverable__small"
				target="_blank"
				rel="noopener noreferrer"
				href="https://svelte-draw.invalid/?utm_source=examples&utm_medium=organic&utm_campaign=examples"
			>
				<SidebarIcon name="external" />
				<span>Visit the docs</span>
			</a>
		</div>
	</nav>
	<div class="example__content" role="main">
		{@render children()}
		{#if dialogExample}
			{#key dialogExample.path}
				<ExampleInfoDialog example={dialogExample} onClose={() => (dialogExample = null)} />
			{/key}
		{/if}
	</div>
</div>
