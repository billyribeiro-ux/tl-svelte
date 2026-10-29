<script lang="ts">
	import { modulate } from '@svelte-draw/utils'
	import { getEditor } from '../context/editor'
	import type { TLGridProps } from '../context/components'
	import { createUniqueSafeId, suffixSafeId } from './safeId'

	let { x, y, z, size }: TLGridProps = $props()

	const id = createUniqueSafeId('grid')
	const editor = getEditor()
	const { gridSteps } = editor.options
</script>

<svg class="tl-grid" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
	<defs>
		{#each gridSteps as { min, mid, step }, i (i)}
			{@const s = step * size * z}
			{@const xo = 0.5 + x * z}
			{@const yo = 0.5 + y * z}
			{@const gxo = xo > 0 ? xo % s : s + (xo % s)}
			{@const gyo = yo > 0 ? yo % s : s + (yo % s)}
			{@const opacity = z < mid ? modulate(z, [min, mid], [0, 1]) : 1}
			<pattern id={suffixSafeId(id, `${step}`)} width={s} height={s} patternUnits="userSpaceOnUse">
				<circle class="tl-grid-dot" cx={gxo} cy={gyo} r={1} {opacity} />
			</pattern>
		{/each}
	</defs>
	{#each gridSteps as { step }, i (i)}
		<rect width="100%" height="100%" fill={`url(#${id}_${step})`} />
	{/each}
</svg>
