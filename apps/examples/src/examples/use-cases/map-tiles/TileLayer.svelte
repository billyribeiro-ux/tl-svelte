<script lang="ts" module>
	import { getTilePageSize } from './mercator'

	// [1]
	function getTileUrl(z: number, x: number, y: number) {
		return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
	}

	/** How many zoom levels of fallback to keep painted under the sharp tiles. See [5]. */
	const UNDERLAY_DEPTH = 3

	interface Tile {
		key: string
		url: string
		left: number
		top: number
		size: number
	}

	function renderTiles(mapZoom: number, minX: number, minY: number, maxX: number, maxY: number) {
		const tileSize = getTilePageSize(mapZoom)
		const elements: Tile[] = []
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				elements.push({
					key: `${mapZoom}/${x}/${y}`,
					url: getTileUrl(mapZoom, x, y),
					left: x * tileSize,
					top: y * tileSize,
					size: tileSize,
				})
			}
		}
		return elements
	}
</script>

<script lang="ts">
	import { clamp, fromComputed, getEditor } from 'svelte-draw'
	import { getMapZoom } from './mercator'

	const editor = getEditor()

	// [2]
	const visibleTiles = fromComputed('visible tiles', () => {
		const dpr = editor.getInstanceState().devicePixelRatio
		const mapZoom = getMapZoom(editor.getZoomLevel(), dpr)
		const tileSize = getTilePageSize(mapZoom)
		const lastTile = 2 ** mapZoom - 1
		const bounds = editor.getViewportPageBounds()
		// [3]
		const minX = clamp(Math.floor(bounds.minX / tileSize) - 1, 0, lastTile)
		const minY = clamp(Math.floor(bounds.minY / tileSize) - 1, 0, lastTile)
		const maxX = clamp(Math.floor(bounds.maxX / tileSize) + 1, 0, lastTile)
		const maxY = clamp(Math.floor(bounds.maxY / tileSize) + 1, 0, lastTile)
		return `${mapZoom},${minX},${minY},${maxX},${maxY}`
	})

	// [4]
	const tiles = $derived.by(() => {
		const [mapZoom, minX, minY, maxX, maxY] = visibleTiles.current.split(',').map(Number)
		const elements: Tile[] = []
		// [5]
		for (let depth = UNDERLAY_DEPTH; depth >= 1; depth--) {
			const zoom = mapZoom - depth
			if (zoom < 0) continue
			// [6]
			const last = 2 ** zoom - 1
			elements.push(
				...renderTiles(
					zoom,
					clamp((minX >> depth) - 1, 0, last),
					clamp((minY >> depth) - 1, 0, last),
					clamp((maxX >> depth) + 1, 0, last),
					clamp((maxY >> depth) + 1, 0, last)
				)
			)
		}
		elements.push(...renderTiles(mapZoom, minX, minY, maxX, maxY))
		return elements
	})
</script>

{#each tiles as tile (tile.key)}
	<img
		class="map-tile"
		src={tile.url}
		alt=""
		draggable="false"
		style:left="{tile.left}px"
		style:top="{tile.top}px"
		style:width="{tile.size}px"
		style:height="{tile.size}px"
	/>
{/each}

<!--
[1]
Tiles come from OpenStreetMap's public tile servers, which are donated infrastructure with a usage
policy attached: attribution is required, and heavy or automated traffic gets blocked. Swap this
function for a provider of your own before putting a tile layer in front of real users.

[2]
The layer renders inside the camera's transform, so panning is already handled for free and a
re-render is only needed when a different set of tiles becomes visible. Returning a string key
rather than an object means `fromComputed` bails out of the update while the same tiles stay on
screen, instead of firing on every frame of a drag.

[3]
One tile of margin on each side. Covering only the viewport means a row is requested at the moment
it scrolls into view, so a fast pan trails an empty strip for as long as the fetch takes.

[4]
Tiles are positioned in page space, so nothing here needs to know where the camera is.

[5]
Crossing a zoom level changes every tile's key, so the keyed `{#each}` swaps the whole grid at once and the
canvas is bare until the new images decode. Painting coarser levels underneath first means there
is always something behind the gap, and they land instantly because they were already on screen
a moment ago.

Depth matters more than it looks. One level is enough for a click-by-click zoom, but a trackpad
pinch crosses several levels before any of them finish loading, and then the single fallback is
as blank as the layer it was covering. Three levels back the sharp tiles with progressively
coarser ones, so a fast sweep or a flick pan always lands on something already loaded.

This roughly triples the tiles fetched for a view. The coarse levels hold few tiles each but
never drop below the margin ring in [6], so they cost more than their quarter-per-level share
suggests. Lower `UNDERLAY_DEPTH` to trade smoothness back for requests.

[6]
Each level gets its own ring of margin rather than inheriting the sharp layer's. Halving the
range at every step rounds that one-tile border away, which leaves the coarse layers ending at
the same edge as the layer they are meant to be covering for - exactly where a flick pan is
heading. A ring here is cheap: these levels hold a quarter as many tiles each.
-->
