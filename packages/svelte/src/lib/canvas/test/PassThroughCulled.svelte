<script lang="ts">
	/**
	 * The shape a comment pin has: the hook's owner stays mounted while the element it is attached to
	 * is culled and later remounted (the pin renders nothing when its anchor leaves the viewport).
	 */
	import { usePassThroughWheelEvents } from '../passThroughWheelEvents'
	import { passThroughState } from './passThroughState.svelte'

	const passThrough = usePassThroughWheelEvents()
</script>

{#if passThroughState.visible}
	<button data-testid="marker" data-tick={passThroughState.tick} {@attach passThrough}>pin</button>
{/if}
