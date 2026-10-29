<script lang="ts">
	import { SVGContainer } from '@svelte-draw/svelte'
	import { fromComputed, getEditor } from 'svelte-draw'

	let {
		opacity,
		radius,
		isSingleNode,
	}: { opacity: number; radius: number; isSingleNode: boolean } = $props()

	const editor = getEditor()
	const zoom = fromComputed('zoom', () => editor.getZoomLevel())
	// Use reactive inputs to track if space key is pressed
	const isSpacePressed = fromComputed('space key pressed', () => editor.inputs.keys.has('Space'))

	const dashArray = $derived(`${3 / zoom.current} ${3 / zoom.current}`)
	const fillNode = $derived(isSingleNode && isSpacePressed.current)
</script>

{#if isSingleNode || !isSpacePressed.current}
	<SVGContainer>
		<g {opacity}>
			<circle
				r={radius}
				stroke="black"
				stroke-dasharray={isSingleNode ? 'none' : dashArray}
				stroke-width={1 / zoom.current}
				fill={fillNode ? 'black' : 'white'}
			/>
			<circle
				cx={0}
				cy={0}
				r={1 / zoom.current}
				stroke="black"
				stroke-width={1 / zoom.current}
				fill="black"
			/>
		</g>
	</SVGContainer>
{/if}
