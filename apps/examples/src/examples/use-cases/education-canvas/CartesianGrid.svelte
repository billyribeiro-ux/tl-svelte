<script lang="ts" module>
	const TICKS = 8
</script>

<svg class="cartesian-grid" width="600" height="600" viewBox="0 0 600 600" stroke="#aaa" color="#aaa">
	{#each Array.from({ length: TICKS * 2 + 1 }) as _, i (i + '_line')}
		{@const step = 600 / (TICKS * 2)}
		{@const opacity = i === TICKS ? 1 : 0.16}
		<g>
			<line x1={0} y1={i * step} x2={600} y2={i * step} stroke-width="1" {opacity} />
			<line x1={i * step} y1={0} x2={i * step} y2={600} stroke-width="1" {opacity} />
		</g>
	{/each}
	<g>
		{#each Array.from({ length: TICKS * 2 + 1 }) as _, index (index + '_textx')}
			{#if index - TICKS !== 0}
				{@const y = 600 - index * (600 / (TICKS * 2))}
				<g>
					<text
						x={312}
						{y}
						dy="0.3em"
						font-family="Arial"
						text-anchor="start"
						letter-spacing=".25em"
						stroke="none"
						fill="#aaa"
						font-weight="bold"
					>
						{-TICKS + index}
					</text>
					<line x1={295} y1={y} x2={305} y2={y} stroke-width="2" />
				</g>
			{/if}
		{/each}
		{#each Array.from({ length: TICKS * 2 + 1 }) as _, index (index + '_texty')}
			{#if index - TICKS !== 0}
				{@const x = index * (600 / (TICKS * 2))}
				<g>
					<text
						{x}
						y={320}
						dy="0.3em"
						font-family="Arial"
						text-anchor="middle"
						stroke="none"
						fill="#aaa"
						font-weight="bold"
					>
						{-TICKS + index}
					</text>
					<line x1={x} y1={295} x2={x} y2={305} stroke-width="2" stroke-linecap="round" />
				</g>
			{/if}
		{/each}
	</g>
</svg>
