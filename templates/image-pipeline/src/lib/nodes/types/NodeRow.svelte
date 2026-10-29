<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	/**
	 * A row in a node. This component just applies some styling.
	 */
	let {
		children,
		class: className,
		...props
	}: { children?: Snippet; class?: string } & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> =
		$props()
</script>

<div {...props} class={['NodeRow', className]}>
	{@render children?.()}
</div>
