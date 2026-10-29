<script lang="ts">
	import Button from '#lib/components/common/Button.svelte'
	import PageTitle from '#lib/components/common/PageTitle.svelte'
	import type { ArticleMeta } from '#types/content-types.js'
	import { cn } from '#utils/cn.js'
	import { version } from '#root/version.js'
	import CopyMarkdownButton from './CopyMarkdownButton.svelte'

	let { article, markdown }: { article: ArticleMeta; markdown: string } = $props()

	const sourceUrlWithVersionTag = $derived(
		article.sectionId === 'reference' && article.sourceUrl
			? article.sourceUrl.replace(
					'/svelte-draw/svelte-draw/blob/main',
					'/svelte-draw/svelte-draw/blob/v' + version
				)
			: undefined
	)
</script>

<section
	class={cn(
		article.sectionId === 'reference'
			? ''
			: 'pb-6 mb-6 md:mb-8 md:pb-8 border-b border-zinc-100 dark:border-zinc-800'
	)}
>
	<div class="flex flex-wrap justify-between gap-x-8 gap-y-3">
		<PageTitle>{article.title}</PageTitle>
		<div class="flex flex-wrap items-center gap-2 mt-1">
			{#if markdown}
				<CopyMarkdownButton {markdown} />
			{/if}
			{#if sourceUrlWithVersionTag}
				<Button
					id="see-source-code"
					href={sourceUrlWithVersionTag}
					newTab
					caption="See source code"
					icon="github"
					size="sm"
					type="secondary"
				/>
			{/if}
		</div>
	</div>
</section>
