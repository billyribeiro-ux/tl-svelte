<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	let props: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
	<path
		d="M4 2L14 8L4 14 Z"
		fill="currentColor"
		stroke="currentColor"
		stroke-width={2}
		fill-rule="evenodd"
		clip-rule="evenodd"
		stroke-linejoin="round"
	/>
</svg>
