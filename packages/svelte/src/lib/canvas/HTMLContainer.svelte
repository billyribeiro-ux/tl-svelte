<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'

	/** @public */
	let { children, class: className = '', ...rest }: HTMLAttributes<HTMLDivElement> = $props()
</script>

<div {...rest} class={['tl-html-container', className]}>
	{@render children?.()}
</div>
