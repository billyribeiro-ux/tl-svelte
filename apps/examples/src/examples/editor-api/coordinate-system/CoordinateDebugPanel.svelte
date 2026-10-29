<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()

	// [2]
	const mouse = fromComputed('mouse', () => {
		const page = editor.inputs.getCurrentPagePoint()
		return {
			page,
			screen: editor.pageToScreen(page),
			viewport: editor.pageToViewport(page),
		}
	})

	// [3]
	const viewportScreenBounds = fromComputed('screen bounds', () => editor.getViewportScreenBounds())
	const viewportPageBounds = fromComputed('page bounds', () => editor.getViewportPageBounds())
</script>

<div class="coordinate-debug-panel">
	<h3>Coordinate systems</h3>

	<div class="coordinate-section">
		<h4>Mouse position</h4>
		<div class="coordinate-row">
			<span class="coordinate-label">Screen:</span>
			<span class="coordinate-value">
				({mouse.current.screen.x.toFixed(0)}, {mouse.current.screen.y.toFixed(0)})
			</span>
		</div>
		<div class="coordinate-row">
			<span class="coordinate-label">Page:</span>
			<span class="coordinate-value">
				({mouse.current.page.x.toFixed(0)}, {mouse.current.page.y.toFixed(0)})
			</span>
		</div>
		<div class="coordinate-row">
			<span class="coordinate-label">Viewport:</span>
			<span class="coordinate-value">
				({mouse.current.viewport.x.toFixed(0)}, {mouse.current.viewport.y.toFixed(0)})
			</span>
		</div>
	</div>

	<div class="coordinate-section">
		<h4>Viewport bounds</h4>
		<div class="coordinate-row">
			<span class="coordinate-label">Screen:</span>
			<span class="coordinate-value">
				({viewportScreenBounds.current.x.toFixed(0)}, {viewportScreenBounds.current.y.toFixed(0)}, {viewportScreenBounds.current.w.toFixed(0)}×{viewportScreenBounds.current.h.toFixed(0)})
			</span>
		</div>
		<div class="coordinate-row">
			<span class="coordinate-label">Page:</span>
			<span class="coordinate-value">
				({viewportPageBounds.current.x.toFixed(0)}, {viewportPageBounds.current.y.toFixed(0)}, {viewportPageBounds.current.w.toFixed(0)}×{viewportPageBounds.current.h.toFixed(0)})
			</span>
		</div>
	</div>
</div>
