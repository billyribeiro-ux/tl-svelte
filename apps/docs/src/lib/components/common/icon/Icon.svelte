<script lang="ts" module>
	import type { HeroiconName } from './heroicons'

	const heroiconNames = {
		check: '24/outline/Check',
		copy: '24/outline/Clipboard',
		paperclip: '24/outline/PaperClip',
		play: '20/solid/Play',
		bolt: '24/outline/Bolt',
		cube: '24/outline/Cube',
		wrench: '24/outline/WrenchScrewdriver',
		shield: '24/outline/ShieldCheck',
	} as const satisfies Record<string, HeroiconName>

	export type IconName =
		| keyof typeof heroiconNames
		| 'discord'
		| 'github'
		| 'linkedin'
		| 'svelte-draw'
		| 'twitter'
</script>

<script lang="ts">
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import DiscordIcon from './DiscordIcon.svelte'
	import GithubIcon from './GithubIcon.svelte'
	import LinkedinIcon from './LinkedinIcon.svelte'
	import SvelteDrawIcon from './SvelteDrawIcon.svelte'
	import TwitterIcon from './TwitterIcon.svelte'

	let { icon, class: className }: { icon: IconName; class: string } = $props()
</script>

{#if icon === 'discord'}
	<DiscordIcon class={className} />
{:else if icon === 'github'}
	<GithubIcon class={className} />
{:else if icon === 'linkedin'}
	<LinkedinIcon class={className} />
{:else if icon === 'svelte-draw'}
	<SvelteDrawIcon class={className} />
{:else if icon === 'twitter'}
	<TwitterIcon class={className} />
{:else}
	<Heroicon name={heroiconNames[icon]} class={className} />
{/if}
