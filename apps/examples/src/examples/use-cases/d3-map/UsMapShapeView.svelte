<script lang="ts">
	import { SVGContainer } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import { on } from 'svelte/events'
	import { MAP_HEIGHT, MAP_WIDTH } from './us-map-data'

	let {
		w,
		h,
		states,
		onExplode,
	}: {
		w: number
		h: number
		states: { id: string; pathData: string; fill: string }[]
		onExplode(): void
	} = $props()

	const scaleX = $derived(w / MAP_WIDTH)
	const scaleY = $derived(h / MAP_HEIGHT)

	// Svelte delegates `onpointerdown` to the app root, which runs after the editor container's
	// native listener, so stopping the event has to happen on the button itself.
	const stopPointerDown: Attachment<HTMLButtonElement> = (button) =>
		on(button, 'pointerdown', (e) => e.stopPropagation())
</script>

<SVGContainer>
	<g transform={`scale(${scaleX}, ${scaleY})`}>
		{#each states as state (state.id)}
			<path
				d={state.pathData}
				fill={state.fill}
				stroke="#fff"
				stroke-width={1 / scaleX}
				stroke-linejoin="round"
			/>
		{/each}
	</g>
</SVGContainer>
<!-- [2] -->
<button
	{@attach stopPointerDown}
	class="d3-map-explode-button"
	onclick={onExplode}
	style="pointer-events: all;"
>
	Explode states
</button>

<!--
[2]
Stopping pointer-down propagation keeps the select tool from starting a drag on the map
shape when the button is pressed, so the click reaches the button. Shape contents don't
receive pointer events by default, hence `pointer-events: all`.
-->
