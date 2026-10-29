<script lang="ts">
	import type { Snippet } from 'svelte'
	import { cn } from '#utils/cn.js'
	import Heroicon from '#lib/components/common/Heroicon.svelte'

	let {
		type = 'info',
		children,
	}: { type?: 'info' | 'warning' | 'critical' | 'quote'; children?: Snippet } = $props()
</script>

<div
	class={cn(
		'py-1 -mx-5 md:mx-0',
		type === 'info' && 'md:px-1 md:rounded-2xl bg-blue-50 dark:bg-blue-950/75',
		type === 'warning' && 'md:px-1 md:rounded-2xl bg-amber-50 dark:bg-amber-900/50',
		type === 'critical' && 'md:px-1 md:rounded-2xl bg-rose-50 dark:bg-rose-950/50'
	)}
>
	<div
		class={cn(
			'flex flex-col sm:flex-row gap-4 w-full p-5 ',
			type === 'quote' && 'border-right border-zinc-400 dark:border-zinc-700 border-l-4',
			type === 'info' && 'md:rounded-xl shadow dark:bg-blue-900/25',
			type === 'warning' && 'md:rounded-xl shadow dark:bg-amber-900/25',
			type === 'critical' && 'md:rounded-xl shadow dark:bg-rose-900/25'
		)}
	>
		{#if type === 'info'}
			<Heroicon name="20/solid/InformationCircle" class="size-5 shrink-0 text-blue-500" />
		{/if}
		{#if type === 'warning'}
			<Heroicon
				name="20/solid/ExclamationTriangle"
				class="size-5 shrink-0 text-amber-500 dark:text-amber-400"
			/>
		{/if}
		{#if type === 'critical'}
			<Heroicon
				name="20/solid/ExclamationCircle"
				class="size-5 shrink-0 text-rose-500 dark:text-rose-400"
			/>
		{/if}
		<div class="-mt-0.5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{@render children?.()}</div>
	</div>
</div>
