<script lang="ts">
	import type { BoxModel, Editor } from 'svelte-draw'
	import { fromComputedWith } from './reactive.svelte'
	import type { RegionHandle } from './region-box'
	import { resizeRegion } from './region-box'
	import RegionResizeHandle from './RegionResizeHandle.svelte'

	/** Draggable handles that resize a region — corners (both axes) or edges (one axis), per the resize
	 *  option. Previews live, commits on release. */
	let {
		editor,
		box,
		handles,
		onPreview,
		onCommit,
	}: {
		editor: Editor
		box: BoxModel
		handles: readonly RegionHandle[]
		onPreview(bounds: BoxModel | null): void
		onCommit(bounds: BoxModel): void
	} = $props()

	// The box at pointer-down, captured so the box prop reflowing under the live preview doesn't move
	// the fixed edges mid-drag.
	let startBox: BoxModel | null = null
	const points = fromComputedWith(
		'region handle points',
		() => ({ x: box.x, y: box.y, w: box.w, h: box.h, handles }),
		({ x, y, w, h, handles: hs }) =>
			hs.map((handle) => {
				const p = editor.pageToViewport({ x: x + handle.x * w, y: y + handle.y * h })
				return { handle, key: `${handle.x}-${handle.y}`, left: p.x, top: p.y }
			})
	)

	function startResize(_handle: RegionHandle, e: PointerEvent) {
		e.stopPropagation()
		startBox = box
		;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
	}
	const resizedTo = (h: RegionHandle, e: PointerEvent): BoxModel =>
		resizeRegion(startBox!, h, editor.screenToPage({ x: e.clientX, y: e.clientY }))
	function onResize(h: RegionHandle, e: PointerEvent) {
		if (startBox) onPreview(resizedTo(h, e))
	}
	function endResize(h: RegionHandle, e: PointerEvent) {
		if (!startBox) return
		const bounds = resizedTo(h, e)
		startBox = null
		const target = e.currentTarget as HTMLElement
		if (target.hasPointerCapture(e.pointerId)) target.releasePointerCapture(e.pointerId)
		onCommit(bounds)
	}
</script>

{#each points.current as point (point.key)}
	<RegionResizeHandle
		handle={point.handle}
		left={point.left}
		top={point.top}
		onStart={startResize}
		onMove={onResize}
		onEnd={endResize}
	/>
{/each}
