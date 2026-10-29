<script lang="ts">
	import Button from '#lib/components/common/Button.svelte'
	import HeadingsMenu from '#lib/components/navigation/HeadingsMenu.svelte'
	import type { ArticleHeading, ArticleMeta } from '#types/content-types.js'
	import DocsArticleInfo from './DocsArticleInfo.svelte'
	import DocsFeedbackWidget from './DocsFeedbackWidget.svelte'

	let { article, headings }: { article: ArticleMeta; headings: ArticleHeading[] } = $props()
</script>

<nav
	class="lg:w-60 flex flex-col xl:pl-5 sticky top-24 shrink-0 xl:order-last xl:h-[calc(100vh-6rem)]"
>
	{#if article.githubLink}
		<div class="mb-12 flex xl:flex-col gap-2">
			<Button
				icon="github"
				type="secondary"
				href={article.githubLink}
				newTab={true}
				caption="View on GitHub"
			/>
		</div>
	{/if}
	<div class="hidden xl:flex flex-col">
		<HeadingsMenu {headings} />
		<DocsArticleInfo {article} />
		<DocsFeedbackWidget class="mb-12" />
	</div>
</nav>
