<script lang="ts">
	import Navigation from '#lib/components/common/Navigation.svelte'
	import HeadingsMenu from '#lib/components/navigation/HeadingsMenu.svelte'
	import type { ArticleHeading, ArticleMeta } from '#types/content-types.js'
	import DocsArticleInfo from './DocsArticleInfo.svelte'
	import DocsFeedbackWidget from './DocsFeedbackWidget.svelte'

	let { article, headings }: { article: ArticleMeta; headings: ArticleHeading[] } = $props()
</script>

<Navigation class="hidden xl:flex pl-12">
	<HeadingsMenu {headings} />
	<DocsArticleInfo {article} />
	<DocsFeedbackWidget class="mb-12" />
</Navigation>
