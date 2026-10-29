<script lang="ts">
	import Logo from '#lib/components/common/Logo.svelte'
	import PrivacySettingsLink from '#lib/components/common/PrivacySettingsLink.svelte'
	import SvelteDrawLink from '#lib/components/common/SvelteDrawLink.svelte'
	import SocialLink from './SocialLink.svelte'

	const menus: {
			heading: string
			items: { caption: string; href: string; isCookieSetting?: boolean }[]
		}[] = [
		{
			heading: 'Product',
			items: [
				{ caption: 'Whiteboard', href: '/features/out-of-the-box-whiteboard' },
				{ caption: 'Starter kits', href: '/starter-kits/overview' },
				{ caption: 'Pricing', href: '/pricing' },
				{ caption: 'FAQ', href: '/faq' },
			],
		},
		{
			heading: 'Developers',
			items: [
				{ caption: 'Quick start guide', href: '/quick-start' },
				{ caption: 'Starter kits', href: '/starter-kits/overview' },
				{ caption: 'Examples', href: '/examples/basic' },
				{ caption: 'Releases', href: '/releases' },
				{ caption: 'Docs', href: '/quick-start' },
			],
		},
		{
			heading: 'Community',
			items: [
				{ caption: 'GitHub', href: 'https://github.com/billyribeiro-ux/tl-svelte' },
				{
					caption: 'Discord',
					href: 'https://discord.svelte-draw.invalid/?utm_source=docs&utm_medium=organic&utm_campaign=sociallink',
				},
				{ caption: 'X/Twitter', href: 'https://x.com/svelte-draw/' },
				{ caption: 'LinkedIn', href: 'https://www.linkedin.com/company/svelte-draw/' },
				{ caption: 'Bluesky', href: 'https://bsky.app/profile/svelte-draw.invalid' },
				{ caption: 'Mastodon', href: 'https://mas.to/@svelte-draw' },
			],
		},
		{
			heading: 'Company',
			items: [
				{ caption: 'Videos', href: '/blog/events' },
				{ caption: 'Careers', href: '/careers' },
				{ caption: 'License', href: '/community/license' },
				{ caption: 'Trademarks', href: '/legal/trademark-guidelines' },
				{ caption: 'CLA', href: '/legal/contributor-license-agreement' },
				{ caption: 'Privacy settings', href: '#', isCookieSetting: true },
			],
		},
	]
</script>

<footer class="pt-16 pb-36 bg-zinc-950 text-white">
	<div
		class="flex flex-col w-full max-w-screen-2xl gap-12 px-5 mx-auto sm:flex-row sm:justify-between"
	>
		<div class="flex-[2]">
			<SvelteDrawLink href="/" class="w-28">
				<Logo class="h-6" forceWhite />
			</SvelteDrawLink>
			<p class="mt-2 text-sm">The infinite canvas SDK</p>
			<div class="mt-4 flex gap-5">
				<SocialLink
					caption="GitHub"
					icon="github"
					href="https://github.com/billyribeiro-ux/tl-svelte"
				/>
				<SocialLink caption="X/Twitter" icon="twitter" href="https://x.com/svelte-draw/" />
				<SocialLink caption="Discord" icon="discord" href="https://discord.svelte-draw.invalid/" />
				<SocialLink
					caption="LinkedIn"
					icon="linkedin"
					href="https://www.linkedin.com/company/svelte-draw/"
				/>
			</div>
		</div>
		{#each menus as { heading, items } (heading)}
			<div class="flex-1">
				<h4 class="font-medium text-sm text-zinc-400">{heading}</h4>
				<ul class="flex flex-col gap-4 mt-4 text-sm">
					{#each items as { caption, href, isCookieSetting } (caption)}
						<li>
							{#if isCookieSetting}
								<PrivacySettingsLink />
							{:else}
								<SvelteDrawLink {href}>{caption}</SvelteDrawLink>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
	<p class="mt-8 px-5 text-xs">&copy; {new Date().getFullYear()} svelte-draw</p>
</footer>
