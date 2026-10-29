<script lang="ts">
	import classNames from 'classnames'
	import type { HTMLAttributes } from 'svelte/elements'

	/**
	 * A row in a node. This component just applies some styling.
	 */
	let { children, class: className, ...props }: HTMLAttributes<HTMLDivElement> = $props()
</script>

<div {...props} class={classNames('NodeRow', className)}>
	{@render children?.()}
</div>
