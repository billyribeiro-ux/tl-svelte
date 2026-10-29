<script lang="ts">
	import { cn } from '#utils/cn.js'
	import Content from '#lib/components/content/Content.svelte'
	import Example from '#lib/components/content/Example.svelte'
	import StarterKitEmbed from '#lib/components/content/StarterKitEmbed.svelte'
	import DocsFeedbackWidget from '#lib/components/docs/DocsFeedbackWidget.svelte'
	import DocsFooter from '#lib/components/docs/DocsFooter.svelte'
	import DocsHeader from '#lib/components/docs/DocsHeader.svelte'
	import DocsMobileSidebar from '#lib/components/docs/DocsMobileSidebar.svelte'
	import DocsSidebar from '#lib/components/docs/DocsSidebar.svelte'
	import DocsStarterSidebar from '#lib/components/docs/DocsStarterSidebar.svelte'
	import DocsTableOfContents from '#lib/components/docs/DocsTableOfContents.svelte'
	import SearchButton from '#lib/components/search/SearchButton.svelte'

	let { data } = $props()

	const article = $derived(data.article)
	const isStarterKitOverview = $derived(article.id === 'starter-kits/starter-kits_ucg/overview')

	const starterKitProseClass = cn(
		'mb-8',
		'prose dark:prose-invert prose-sm prose-zinc text-zinc-800 dark:text-zinc-200 sm:prose-base w-full max-w-full',
		'prose-code:before:content-none prose-code:after:content-none prose-code:bg-zinc-100 dark:prose-code:!bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal',
		'prose-a:no-underline prose-a:text-blue-500 hover:prose-a:text-blue-600 dark:hover:prose-a:text-blue-400 prose-a:font-normal',
		'prose-blockquote:text-zinc-800 dark:prose-blockquote:text-zinc-200 prose-blockquote:font-normal prose-blockquote:border-none prose-blockquote:px-4 prose-blockquote:leading-normal prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-900 prose-blockquote:py-3 prose-blockquote:rounded-xl',
		'prose-table:bg-zinc-50 dark:prose-table:bg-zinc-900 prose-table:rounded-xl prose-table:text-sm',
		'prose-th:text-left prose-th:font-semibold prose-th:uppercase prose-th:text-xs prose-th:border-l prose-th:border-white dark:prose-th:border-zinc-950 prose-th:py-3 prose-th:px-4',
		'prose-tr:border-t prose-tr:border-white dark:prose-tr:border-zinc-950',
		'prose-td:border-l first:prose-td:border-l-0 prose-td:border-white dark:prose-td:border-zinc-950 prose-td:py-3 prose-td:px-4',
		'prose-hr:border-zinc-100 dark:prose-hr:border-zinc-800',
		'prose-h1:scroll-mt-20 prose-h2:scroll-mt-20 prose-h3:scroll-mt-20 prose-h4:scroll-mt-20 prose-h5:scroll-mt-20'
	)
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	{#if data.seo.description}
		<meta name="description" content={data.seo.description} />
	{/if}
	<link rel="canonical" href={data.seo.canonical} />
</svelte:head>

<div class="w-full max-w-screen-2xl mx-auto md:px-5 md:flex md:items-start md:pt-12 isolate">
	<DocsSidebar
		links={data.sidebarLinks}
		sectionId={article.sectionId}
		categoryId={article.categoryId}
		articleId={article.id}
	/>
	<div
		class="sticky top-14 z-10 flex items-center justify-between w-full h-12 px-5 bg-white border-b border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur md:hidden"
	>
		<DocsMobileSidebar
			links={data.sidebarLinks}
			sectionId={article.sectionId}
			categoryId={article.categoryId}
			articleId={article.id}
		/>
		<SearchButton type="docs" layout="mobile" class="hidden -mr-2 sm:block" />
	</div>
	{#if article.sectionId === 'examples'}
		<main class="relative w-full px-5 pt-12 shrink md:pt-0 min-w-[1px]">
			<DocsHeader {article} markdown={data.markdown} />
			{#if data.descriptionTree}
				<Content nodes={data.descriptionTree} type={article.sectionId} />
			{/if}
			{#if data.example}
				<Example slug={data.example.slug} files={data.example.files} />
			{/if}
			{#if data.contentTree.length}
				<Content nodes={data.contentTree} type={article.sectionId} />
			{/if}
			<div class="mx-auto w-full max-w-sm mt-8 mb-16">
				<DocsFeedbackWidget />
			</div>
			<DocsFooter links={data.links} />
		</main>
	{:else if article.sectionId === 'starter-kits' && !isStarterKitOverview}
		<main class="relative w-full px-5 pt-12 shrink md:pt-0 min-w-[1px]">
			<DocsHeader {article} markdown={data.markdown} />
			<div class={starterKitProseClass}>
				{#if data.descriptionTree}
					<Content nodes={data.descriptionTree} type={article.sectionId} class="mb-6" />
				{/if}
				{#if article.embed}
					<StarterKitEmbed id={article.embed} />
				{/if}
			</div>
			<div class="flex flex-col xl:flex-row gap-6 relative">
				<DocsStarterSidebar {article} headings={data.headings} />
				<Content nodes={data.contentTree} type={article.sectionId} />
			</div>
			<DocsFooter links={data.links} />
		</main>
	{:else if article.sectionId === 'starter-kits'}
		<main class="relative w-full px-5 pt-12 shrink md:pt-0 min-w-[1px]">
			<DocsHeader {article} markdown={data.markdown} />
			<Content nodes={data.contentTree} type={article.sectionId} />
			<DocsFooter links={data.links} />
			<div class="mx-auto w-full max-w-sm mt-8 mb-16">
				<DocsFeedbackWidget />
			</div>
		</main>
	{:else}
		<main class="relative grow px-5 pt-12 md:pr-0 lg:pl-12 xl:pr-12 md:pt-0 min-w-[1px]">
			<DocsHeader {article} markdown={data.markdown} />
			<Content nodes={data.contentTree} type={article.sectionId} />
			<DocsFooter links={data.links} />
		</main>
		<DocsTableOfContents {article} headings={data.headings} />
	{/if}
</div>
