<script lang="ts">
	import type { Snippet } from 'svelte'
	import { cn } from '#utils/cn.js'

	let { class: className, children }: { class?: string; children?: Snippet } = $props()
</script>

<nav
	class={cn('w-52 lg:w-60 shrink-0 flex flex-col sticky top-24 overflow-hidden', className)}
	style="height: calc(100vh - 6rem)"
>
	{@render children?.()}
</nav>
