<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	let props: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg width={11} height={11} viewBox="0 0 11 11" aria-hidden="false" {...props} class="tl-spinner">
	<g stroke-width={2} fill="none" fill-rule="evenodd">
		<circle stroke-opacity={0.25} cx={5.5} cy={5.5} r={4.5} stroke="currentColor" />
		<path stroke-linecap="round" d="M10.5 5.5c0-2.5-2.5-4.5-4.5-4.5" stroke="currentColor" />
	</g>
</svg>
