<script lang="ts">
	import { page } from '$app/state'
	import Logo from '#lib/components/common/Logo.svelte'
	import ThemeSwitch from '#lib/components/common/ThemeSwitch.svelte'
	import type { IconName } from '#lib/components/common/icon/Icon.svelte'
	import SearchButton from '#lib/components/search/SearchButton.svelte'
	import SocialLink from './SocialLink.svelte'

	const socialLinks: { caption: string; icon: IconName; href: string }[] = [
		{
			caption: 'Twitter/X',
			icon: 'twitter',
			href: 'https://x.com/svelte-draw/',
		},
		{
			caption: 'Discord',
			icon: 'discord',
			href: 'https://discord.svelte-draw.invalid/?utm_source=docs&utm_medium=organic&utm_campaign=sociallink',
		},
		{
			caption: 'GitHub',
			icon: 'github',
			href: 'https://github.com/billyribeiro-ux/tl-svelte',
		},
	]

	const pathname = $derived(page.url.pathname)
	const socialsOpacityEffect = $derived(pathname === '/search')

	// framer-motion `useTransform(scrollY, [0, 32], [1, 0])`: linear, clamped to [0, 1].
	let scrollY = $state(0)
	const navOpacity = $derived(Math.min(1, Math.max(0, 1 - scrollY / 32)))
</script>

<svelte:window bind:scrollY />

<header class="sticky top-0 w-full bg-white dark:bg-zinc-950 z-10">
	<nav
		class="w-full max-w-screen-2xl mx-auto px-5 h-14 md:h-[4.5rem] flex justify-between items-center text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 dark:md:border-transparent md:border-transparent"
	>
		<a href="/" class="w-28">
			<Logo class="h-6" />
		</a>
		<ul
			style:opacity={socialsOpacityEffect ? navOpacity : 1}
			class="hidden sm:flex w-28 gap-4 justify-end xl:!opacity-100"
		>
			{#each socialLinks as item (item.caption)}
				<li>
					<SocialLink {...item} />
				</li>
			{/each}
			<ThemeSwitch />
		</ul>
		<div class="flex items-center sm:hidden -mr-2">
			{#if !pathname.startsWith('/search')}
				<SearchButton type={pathname.startsWith('/blog') ? 'blog' : 'docs'} layout="mobile" />
			{/if}
			<ThemeSwitch />
		</div>
	</nav>
</header>
