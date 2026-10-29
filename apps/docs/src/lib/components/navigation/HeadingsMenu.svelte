<script lang="ts">
	import type { ArticleHeading } from '#types/content-types.js'
	import { cn } from '#utils/cn.js'

	let { headings }: { headings: ArticleHeading[] } = $props()

	let activeSlug = $state('')

	$effect(() => {
		const handleScroll = () => {
			let current = ''
			for (const { slug } of headings) {
				const element = document.getElementById(slug)
				if (element && element.getBoundingClientRect().top < 100) current = slug
			}
			activeSlug = current
		}
		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	})
</script>

{#if headings.length > 0}
	<div class="relative overflow-y-auto shrink mb-12">
		<div class="sticky top-0">
			<h4
				class="block text-xs font-semibold text-black uppercase bg-white dark:bg-zinc-950 dark:text-white"
			>
				On this page
			</h4>
			<div class="w-full h-2 bg-gradient-to-b from-white dark:from-zinc-950"></div>
		</div>
		<ul class="flex flex-col gap-2 text-sm break-words">
			{#each headings as { title, level, slug }, index (index)}
				<li style="padding-left: {(level - 2) * 0.75}rem">
					<a
						href="#{slug}"
						class={cn(
							slug === activeSlug
								? 'text-black dark:text-white font-semibold'
								: 'hover:text-zinc-800 dark:hover:text-zinc-100'
						)}
					>
						{title}
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
