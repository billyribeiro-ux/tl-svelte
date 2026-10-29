<script lang="ts">
	/**
	 * The shape the navigation panel has: a pass-through root wrapping another pass-through root (the
	 * minimap).
	 */
	import { usePassThroughWheelEvents } from '../passThroughWheelEvents'

	const outer = usePassThroughWheelEvents()
	const inner = usePassThroughWheelEvents()
</script>

<div {@attach outer}>
	<button data-testid="marker" {@attach inner}>minimap</button>
</div>
