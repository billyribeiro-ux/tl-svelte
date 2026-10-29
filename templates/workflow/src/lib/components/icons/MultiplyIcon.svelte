<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	let props: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
	<path
		d="M10.8284 5.17188L5.17154 10.8287"
		stroke="currentColor"
		stroke-width="1.33333"
		stroke-linecap="round"
	/>
	<path
		d="M10.8284 10.8287L5.17154 5.17188"
		stroke="currentColor"
		stroke-width="1.33333"
		stroke-linecap="round"
	/>
</svg>
