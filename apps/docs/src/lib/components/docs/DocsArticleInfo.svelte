<script lang="ts">
	import { format } from 'date-fns'
	import BackToTopButton from '#lib/components/common/BackToTopButton.svelte'
	import GithubIcon from '#lib/components/common/icon/GithubIcon.svelte'
	import type { ArticleMeta } from '#types/content-types.js'

	const githubContentRoot =
		'https://github.com/billyribeiro-ux/tl-svelte/blob/main/apps/docs/content/'

	let { article }: { article: ArticleMeta } = $props()
</script>

<!--
	Reference pages are source code and already link to it via 'See source code'. Keyed on
	section, not `authorId === 'api'`: that's also the default for articles with no `author:`.
-->
{#if article.sectionId !== 'reference'}
	<div class="shrink-0 text-xs flex flex-col gap-2 mb-12">
		{#if article.date}
			<p>Last edited on {format(new Date(article.date), 'MMM dd, yyyy')}</p>
		{/if}
		{#if article.sourceUrl}
			<a
				href={`${githubContentRoot}${article.sourceUrl}`}
				class="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
			>
				<GithubIcon class="h-3.5" />
				<span>Edit this page on GitHub</span>
			</a>
		{/if}
		<BackToTopButton />
	</div>
{/if}
