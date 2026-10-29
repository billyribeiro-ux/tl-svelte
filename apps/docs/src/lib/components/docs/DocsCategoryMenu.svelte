<script lang="ts">
	import { page } from '$app/state'
	import type { HeroiconName } from '#lib/components/common/icon/heroicons.js'
	import NavigationLink from '#lib/components/navigation/NavigationLink.svelte'

	const categoryLinks: {
		caption: string
		icon: HeroiconName
		href: string
		active: (pathname: string) => boolean
	}[] = [
		{
			caption: 'Quick start',
			icon: '16/solid/RocketLaunch',
			href: '/quick-start',
			// The article lives at /getting-started/* in the content DB and is served at /quick-start
			// etc.; match both spellings.
			active: (pathname) =>
				['/quick-start', '/installation', '/releases', '/getting-started'].some((e) =>
					pathname.startsWith(e)
				),
		},
		{
			caption: 'Documentation',
			icon: '20/solid/AcademicCap',
			href: '/docs/editor',
			active: (pathname) =>
				['/docs', '/sdk-features', '/community'].some((e) => pathname.startsWith(e)),
		},
		{
			caption: 'Reference',
			icon: '20/solid/CommandLine',
			href: '/reference/editor/Editor',
			active: (pathname) => pathname.startsWith('/reference'),
		},
		{
			caption: 'Starter kits',
			icon: '20/solid/Cube',
			href: '/starter-kits/overview',
			active: (pathname) => ['/starter-kits'].some((e) => pathname.startsWith(e)),
		},
		{
			caption: 'Examples',
			icon: '20/solid/Play',
			href: '/examples/basic',
			active: (pathname) => pathname.startsWith('/examples'),
		},
	]
</script>

<ul class="flex flex-col gap-3 shrink-0 pb-4">
	{#each categoryLinks as item (item.href)}
		<li>
			<NavigationLink
				caption={item.caption}
				icon={item.icon}
				href={item.href}
				active={item.active(page.url.pathname)}
			/>
		</li>
	{/each}
</ul>
