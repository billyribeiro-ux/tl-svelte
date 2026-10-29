<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { VecLike } from 'svelte-draw'

	let {
		center,
		armTop,
		armLeft,
		armRight,
	}: { center: VecLike; armTop: VecLike; armLeft: VecLike; armRight: VecLike } = $props()
</script>

<HTMLContainer>
	<svg class="tl-svg-container">
		<line x1={center.x} y1={center.y} x2={armTop.x} y2={armTop.y} stroke="black" stroke-width={2} />
		<line
			x1={center.x}
			y1={center.y}
			x2={armLeft.x}
			y2={armLeft.y}
			stroke="black"
			stroke-width={2}
		/>
		<line
			x1={center.x}
			y1={center.y}
			x2={armRight.x}
			y2={armRight.y}
			stroke="black"
			stroke-width={2}
		/>
	</svg>
</HTMLContainer>
