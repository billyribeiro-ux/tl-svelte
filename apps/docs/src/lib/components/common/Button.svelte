<script lang="ts">
	import { cn } from '#utils/cn.js'
	import { track } from '#lib/analytics.js'
	import Heroicon from './Heroicon.svelte'
	import Icon, { type IconName } from './icon/Icon.svelte'

	let {
		id,
		href,
		newTab,
		onclick,
		caption,
		icon,
		arrow,
		class: classNameProp,
		size = 'base',
		type = 'primary',
		darkRingOffset,
	}: {
		id?: string
		href?: string
		newTab?: boolean
		onclick?: (event: MouseEvent) => void
		caption: string
		icon?: IconName
		arrow?: 'left' | 'right'
		class?: string
		size?: 'xs' | 'sm' | 'base' | 'lg'
		type?: 'primary' | 'secondary' | 'tertiary' | 'black'
		darkRingOffset?: boolean
	} = $props()

	const iconSizes = { xs: 'h-3', sm: 'h-3.5', base: 'h-4', lg: 'h-5' }

	const className = $derived(
		cn(
			'relative overflow-hidden flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900',
			darkRingOffset ? 'focus:ring-offset-zinc-900' : 'focus:ring-offset-zinc-50',
			size === 'xs' && 'h-6 px-2 gap-1.5 rounded-md text-xs',
			size === 'sm' && 'h-7 px-3 gap-2 rounded-md text-sm',
			size === 'base' && 'h-9 px-4 gap-2.5 rounded-lg text-base',
			size === 'lg' && 'h-11 px-5 gap-3 rounded-xl text-lg',
			type === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-400',
			type === 'black' &&
				'bg-black text-white dark:text-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100',
			type === 'secondary' &&
				'bg-zinc-100 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700',
			type === 'tertiary' &&
				'text-black dark:text-white dark:hover:text-zinc-200 hover:text-zinc-700',
			classNameProp
		)
	)
</script>

{#snippet content()}
	{#if arrow === 'left'}<Heroicon name="20/solid/ArrowLongLeft" class={iconSizes[size]} />{/if}
	{#if icon}<Icon {icon} class={iconSizes[size]} />{/if}
	<!-- no word wrapping -->
	<span class="whitespace-nowrap">{caption}</span>
	{#if arrow === 'right'}<Heroicon name="20/solid/ArrowLongRight" class={iconSizes[size]} />{/if}
{/snippet}

{#if href}
	<a
		{href}
		target={newTab ? '_blank' : undefined}
		rel={newTab ? 'noopener noreferrer' : undefined}
		class={className}
		onclick={(e) => {
			onclick?.(e)
			if (id) track('button', { id })
		}}
	>
		{@render content()}
	</a>
{:else if onclick}
	<button
		onclick={(e) => {
			if (id) track('button', { id })
			onclick?.(e)
		}}
		class={className}
	>
		{@render content()}
	</button>
{/if}
