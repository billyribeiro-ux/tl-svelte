<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	let { children, ...rest }: HTMLAttributes<HTMLHeadingElement> & { children?: Snippet } = $props()
</script>

<h4 class="!-mb-4 !mt-8 uppercase text-sm font-semibold" {...rest}>{@render children?.()}</h4>
