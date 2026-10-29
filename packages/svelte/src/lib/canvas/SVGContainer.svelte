<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	/** @public */
	let { children, class: className = '', ...rest }: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg {...rest} class={['tl-svg-container', className]} aria-hidden="true">
	{@render children?.()}
</svg>
