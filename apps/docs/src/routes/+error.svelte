<script lang="ts">
	import { page } from '$app/state'
	import DiscordIcon from '#lib/components/common/icon/DiscordIcon.svelte'
	import DocsSearchBar from '#lib/components/docs/DocsSearchBar.svelte'
	import NavigationLink from '#lib/components/navigation/NavigationLink.svelte'
	import type { HeroiconName } from '#lib/components/common/icon/heroicons.js'
	import { assetUrl } from '#utils/asset-url.js'

	const links: { caption: string; icon: HeroiconName; href: string }[] = [
		{ caption: 'Quick start', icon: '16/solid/RocketLaunch', href: '/quick-start' },
		{ caption: 'Guides', icon: '20/solid/AcademicCap', href: '/docs/editor' },
		{ caption: 'Reference', icon: '20/solid/BookOpen', href: '/reference/editor/Editor' },
		{ caption: 'Examples', icon: '20/solid/Play', href: '/examples/basic' },
		{ caption: 'Blog', icon: '20/solid/Newspaper', href: '/blog' },
	]
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page not found' : 'Something went wrong'} • svelte-draw</title>
</svelte:head>

<div class="min-h-screen">
	<DocsSearchBar />
	<section class="flex flex-col items-center justify-center py-16 md:py-32 px-5">
		{#if page.status === 404}
			<!-- 404.svg is a handwritten drawing; its intrinsic size is the viewBox, w-64 sets the width -->
			<img src={assetUrl('/images/404.svg')} alt="404 - Page not found" width="220" height="136" class="w-64" />
			<h1 class="font-hand text-black dark:text-white text-2xl">page not found :(</h1>
			<p class="mt-8 max-w-md text-center text-balance">
				There's nothing here. You may want to look at these pages to find what you're looking for:
			</p>
			<ul class="mt-8 flex flex-wrap justify-center gap-8">
				{#each links as item (item.href)}
					<li>
						<NavigationLink {...item} active={false} />
					</li>
				{/each}
			</ul>
		{:else}
			<h1 class="font-hand text-black dark:text-white text-2xl">something went wrong :(</h1>
			<p class="mt-8 max-w-md text-center text-balance">
				{page.error?.message ?? 'An unexpected error occurred.'}
			</p>
		{/if}
		<p class="mt-32 max-w-md text-center text-balance text-sm">
			You can always ask for help in our welcoming community on
			<a
				href="https://discord.svelte-draw.invalid/?utm_source=docs&utm_medium=organic&utm_campaign=sociallink"
				class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
			>
				<DiscordIcon class="h-3.5 mb-0.5 ml-0.5 inline" />
				<span> Discord</span>
			</a>
			.
		</p>
	</section>
</div>
