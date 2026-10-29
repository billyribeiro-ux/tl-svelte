<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import { getMapZoom, pageToLngLat } from './mercator'

	const editor = getEditor()
	// [2]
	const readout = fromComputed('readout', () => {
		const { x, y } = editor.inputs.getCurrentPagePoint()
		const { lng, lat } = pageToLngLat(x, y)
		const dpr = editor.getInstanceState().devicePixelRatio
		return `${lat.toFixed(4)}, ${lng.toFixed(4)} · z${getMapZoom(editor.getZoomLevel(), dpr)}`
	})
</script>

<!-- [3] -->
<div class="tlui-menu map-top-panel">
	<span class="map-readout">{readout.current}</span>
	<!-- [4] -->
	<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
		© OpenStreetMap contributors
	</a>
</div>

<!--
[2]
Because page space is a real coordinate system here, any page point converts back to a longitude
and latitude. Annotations drawn on the map are geographic data, not just marks on a canvas.

[3]
`tlui-layout` sets `pointer-events: none`, so a panel that contains anything clickable has to opt
back in. Borrowing `tlui-menu` does that and gives the panel the usual svelte-draw surface styles.

[4]
OpenStreetMap requires visible attribution wherever its tiles are shown. It lives in the top panel
because the bottom corners of the canvas are already taken by the toolbar, the zoom control, and
the svelte-draw watermark.
-->
