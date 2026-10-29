<script lang="ts">
	import { cn } from '#utils/cn.js'
	import Heroicon from '#lib/components/common/Heroicon.svelte'
	import type { HeroiconName } from '#lib/components/common/icon/heroicons.js'

	let {
		caption,
		icon,
		href,
		active,
	}: {
		caption: string
		icon?: HeroiconName
		href?: string
		active: boolean
	} = $props()
</script>

{#if href}
	<a
		{href}
		class={cn(
			'flex items-center gap-3',
			active
				? 'font-semibold text-black dark:text-white'
				: 'hover:text-zinc-600 dark:hover:text-zinc-100'
		)}
	>
		{#if icon}
			<div
				class={cn(
					'h-6 w-6 rounded-md flex items-center justify-center',
					active
						? 'bg-black text-white dark:bg-white dark:text-black'
						: 'bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-300'
				)}
			>
				<Heroicon name={icon} class="h-4" />
			</div>
		{/if}
		<span>{caption}</span>
	</a>
{/if}
