<script lang="ts">
	import type { BoxModel, Editor } from 'svelte-draw'
	import { fromComputedWith } from './reactive.svelte'

	/** A region's dashed box. Purely visual — a region moves by its pin and resizes from its corner
	 *  handles, so the box itself takes no pointer events. Positioned in viewport space, as a sibling
	 *  of the pins in the canvas layer. */
	let { editor, box }: { editor: Editor; box: BoxModel } = $props()

	const rect = fromComputedWith(
		'region rect',
		() => ({ x: box.x, y: box.y, w: box.w, h: box.h }),
		({ x, y, w, h }) => {
			// Position from the page→viewport top-left; screen size scales with zoom, page size doesn't.
			const topLeft = editor.pageToViewport({ x, y })
			const zoom = editor.getZoomLevel()
			return { left: topLeft.x, top: topLeft.y, width: w * zoom, height: h * zoom }
		}
	)
</script>

<div
	class="tlui-cmt-canvas-region"
	style:left="{rect.current.left}px"
	style:top="{rect.current.top}px"
	style:width="{rect.current.width}px"
	style:height="{rect.current.height}px"
></div>
