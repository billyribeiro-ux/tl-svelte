<script lang="ts">
	import type { RegionHandle } from './region-box'

	/** One draggable resize handle. */
	let {
		handle,
		left,
		top,
		onStart,
		onMove,
		onEnd,
	}: {
		handle: RegionHandle
		left: number
		top: number
		onStart(handle: RegionHandle, e: PointerEvent): void
		onMove(handle: RegionHandle, e: PointerEvent): void
		onEnd(handle: RegionHandle, e: PointerEvent): void
	} = $props()
</script>

<!-- The handlers stay delegated to the app root (like React's synthetic events): they run after the
     editor container's own native listeners, which is the order the React original had. -->
<div
	class="tlui-cmt-canvas-region-handle"
	style:left="{left}px"
	style:top="{top}px"
	style:cursor={handle.cursor}
	onpointerdown={(e) => onStart(handle, e)}
	onpointermove={(e) => onMove(handle, e)}
	onpointerup={(e) => onEnd(handle, e)}
></div>
