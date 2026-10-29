<script lang="ts">
	import { onMount } from 'svelte'
	import { cn } from '#utils/cn.js'
	import { theme } from '#lib/theme.svelte.js'
	import Heroicon from './Heroicon.svelte'

	// Read the stored theme on mount (not during SSR) so the first client render matches the server HTML.
	onMount(() => theme.init())

	const icon = $derived(theme.current === 'dark' ? '20/solid/Moon' : '20/solid/Sun')
</script>

<div class="flex flex-col items-end sm:flex-row sm:items-center gap-4 ml-2 md:ml-0">
	<div
		class="hidden md:block h-px sm:h-5 w-full sm:w-px bg-zinc-100 sm:bg-zinc-200 dark:bg-zinc-800 dark:sm:bg-zinc-700"
	></div>
	<button
		onclick={() => theme.toggle()}
		class="hover:text-zinc-600 dark:hover:text-zinc-100"
		aria-label="Toggle theme"
	>
		<div class={cn('transition-opacity duration-300', theme.current ? 'opacity-100' : 'opacity-0')}>
			<Heroicon name={icon} class="size-5" />
		</div>
	</button>
</div>
