<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	let props: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
	<path
		d="M8 3.33301V12.6663"
		stroke="currentColor"
		stroke-width="1.33333"
		stroke-miterlimit="10"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M12.6667 8H3.33334"
		stroke="currentColor"
		stroke-width="1.33333"
		stroke-miterlimit="10"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
