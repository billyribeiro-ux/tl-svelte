<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'
	import type { TLSpinnerProps } from '../context/components'

	let { class: className, ...rest }: TLSpinnerProps & SVGAttributes<SVGSVGElement> = $props()
</script>

<svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="false" {...rest} class={['tl-spinner', className]}>
	<g stroke-width={2} fill="none" fill-rule="evenodd">
		<circle stroke-opacity={0.25} cx={8} cy={8} r={7} stroke="currentColor" />
		<path stroke-linecap="round" d="M15 8c0-4.5-4.5-7-7-7" stroke="currentColor" />
	</g>
</svg>
