<script lang="ts">
	import { type Editor, SvelteDraw, createShapeId } from 'svelte-draw'
	import 'ag-grid-community/styles/ag-grid.css'
	import 'ag-grid-community/styles/ag-theme-quartz.css'
	import 'svelte-draw/svelte-draw.css'
	import { AG_GRID_TYPE, AgGridShapeUtil } from './AgGridShapeUtil'

	const shapeUtils = [AgGridShapeUtil]

	function onMount(editor: Editor) {
		// [4]
		const agGridShapeId = createShapeId('ag-grid')

		if (!editor.getShape(agGridShapeId)) {
			editor.createShape({
				id: agGridShapeId,
				type: AG_GRID_TYPE,
				props: {
					w: 400,
					h: 300,
					rowData: [
						{ make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
						{ make: 'Ford', model: 'F-Series', price: 33850, electric: false },
						{ make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
					],
					columnDefs: [
						{ field: 'make', filter: true, floatingFilter: true, flex: 1 },
						{ field: 'model', flex: 1 },
						{ field: 'price', filter: true, floatingFilter: true, flex: 1 },
						{ field: 'electric', flex: 1 },
					],
				},
			})
			editor.select(agGridShapeId)
			editor.zoomToSelection()
		}
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="ag-grid-example" {shapeUtils} {onMount} />
</div>

<!--
/*
[1]
`canEdit` lets the shape enter the editing state on double-click, which is when we turn on
pointer events so the grid's filters and sorting are usable. While the shape is being edited,
`canScroll` lets wheel events reach the grid so it scrolls its own rows instead of panning
the canvas.

[2]
Reading `getEditingShapeId()` in `component()` re-renders the shape when editing starts or stops.

[3]
AG Grid renders its rows asynchronously. `delaySvgExport` returns a callback that
holds up SVG/image export until it's called, so we wire it to `onGridReady` and exports
don't capture an empty grid.

[4]
The example uses a `persistenceKey`, so the shape survives reloads. Using a fixed id
lets us skip creating a second grid when one already exists.
*/
-->
