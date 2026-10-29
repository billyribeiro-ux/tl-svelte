<script lang="ts">
	import { SvelteDraw, type TLCameraOptions, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { WORLD_SIZE, ZOOM_STEPS, lngLatToPage } from './mercator'
	import './map-tiles.css'
	import MapTopPanel from './MapTopPanel.svelte'
	import TileLayer from './TileLayer.svelte'

	// There's a guide at the bottom of this file!

	const LONDON = { lng: -0.1276, lat: 51.5072 }

	// [1]
	const cameraOptions: TLCameraOptions = {
		isLocked: false,
		wheelBehavior: 'pan',
		panSpeed: 1,
		zoomSpeed: 1,
		zoomSteps: ZOOM_STEPS,
		constraints: {
			bounds: { x: 0, y: 0, w: WORLD_SIZE, h: WORLD_SIZE },
			behavior: 'inside',
			padding: { x: 0, y: 0 },
			origin: { x: 0.5, y: 0.5 },
			initialZoom: 'default',
			baseZoom: 'default',
		},
	}

	// [5]
	let isCameraReady = $state(false)

	const components = $derived<TLComponents>({
		OnTheCanvas: isCameraReady ? TileLayer : null,
		TopPanel: MapTopPanel,
		Grid: null,
	})
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{components}
		options={{ camera: cameraOptions }}
		onMount={(editor) => {
			// [6]
			editor.setCamera({ x: 0, y: 0, z: 1 }, { immediate: true })
			editor.centerOnPoint(lngLatToPage(LONDON.lng, LONDON.lat), { immediate: true })
			isCameraReady = true
		}}
	/>
</div>

<!--
[1]
One zoom step per map zoom level keeps the camera's zoom in and zoom out landing on whole tile
zooms. The constraints stop the camera from panning off the edge of the world into empty space,
which is otherwise easy to do once you are zoomed in.

[5]
Rendering the layer before the camera has been placed fetches a screenful of tiles for the corner
of the world that the camera is about to leave — half the tile requests of a page load, spent on a
view nobody sees. Worth the flag here because the tiles come from donated infrastructure.

[6]
Camera zoom 1 is the base map zoom, so setting zoom before centering puts the map at its native
tile resolution over London.
-->
