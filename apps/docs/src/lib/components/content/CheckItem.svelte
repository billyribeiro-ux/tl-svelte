<script lang="ts">
	import type { Snippet } from 'svelte'
	import Icon from '#lib/components/common/icon/Icon.svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<div class="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
	<Icon icon="check" class="mt-1 h-5 w-5 shrink-0 text-zinc-900 dark:text-zinc-100" />
	<span>{@render children?.()}</span>
</div>
