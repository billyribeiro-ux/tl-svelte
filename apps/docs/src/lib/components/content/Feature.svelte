<script lang="ts">
	import type { Snippet } from 'svelte'
	import Icon, { type IconName } from '#lib/components/common/icon/Icon.svelte'

	let { icon, title, children }: { icon: IconName; title: string; children?: Snippet } = $props()
</script>

<div class="flex flex-col gap-1 not-prose">
	<div class="flex items-center gap-2">
		<Icon {icon} class="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
		<h3 class="font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
	</div>
	<!-- MDX renders block children as their own `<p>`s, so this wrapper must not be a `<p>` — nested `<p>`s are invalid HTML. -->
	<div class="leading-relaxed text-zinc-600 dark:text-zinc-400">{@render children?.()}</div>
</div>
