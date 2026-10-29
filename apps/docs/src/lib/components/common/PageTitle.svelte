<script lang="ts">
	import type { Snippet } from 'svelte'
	import { cn } from '#utils/cn.js'

	let { class: className, children }: { class?: string; children?: Snippet } = $props()
</script>

<h1
	class={cn(
		'font-black text-black dark:text-white text-3xl sm:text-4xl break-words max-w-full',
		className
	)}
>
	{@render children?.()}
</h1>
