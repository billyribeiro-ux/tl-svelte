<svelte:options namespace="svg" />

<script lang="ts">
	import { createUniqueSafeId } from 'svelte-draw'
	import type { PenPathProps } from './PenShapeUtil'

	let { d, fillColor, isPattern, closed, stroke, strokeWidth }: PenPathProps = $props()

	const patternId = createUniqueSafeId('pen-hatch')
</script>

{#if isPattern}
	<defs>
		<pattern id={patternId} width={8} height={8} patternUnits="userSpaceOnUse">
			<path d="M -2 2 L 2 -2 M 0 8 L 8 0 M 6 10 L 10 6" stroke={fillColor} stroke-width={1} />
		</pattern>
	</defs>
{/if}
<path
	{d}
	fill={closed ? (isPattern ? `url(#${patternId})` : fillColor) : 'none'}
	{stroke}
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
/>
