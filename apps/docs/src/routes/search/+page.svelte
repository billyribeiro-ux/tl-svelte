<script lang="ts">
	import DocsMobileSidebar from '#lib/components/docs/DocsMobileSidebar.svelte'
	import DocsSidebar from '#lib/components/docs/DocsSidebar.svelte'
	import FullPageSearch from '#lib/components/search/FullPageSearch.svelte'

	let { data } = $props()
</script>

<svelte:head>
	<title>Search</title>
	<meta name="description" content="Documentation for the svelte-draw SDK." />
</svelte:head>

<div class="w-full max-w-screen-2xl mx-auto md:px-5 md:flex md:pt-8 isolate md:isolation-auto">
	<DocsSidebar links={data.links} />
	<div
		class="sticky top-14 z-10 flex items-center justify-between w-full h-12 px-5 bg-white border-b border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur md:hidden"
	>
		<DocsMobileSidebar links={data.links} />
	</div>
	<main class="relative w-full max-w-3xl px-5 pt-7 shrink md:pr-0 lg:pl-12 xl:pr-12 md:pt-0 min-w-[1px]">
		<FullPageSearch indexName="docs" />
	</main>
</div>
