<script lang="ts">
	import { delaySvgExport } from '@svelte-draw/svelte'
	import { createGrid, type ColDef, type GridApi } from 'ag-grid-community'
	import type { Attachment } from 'svelte/attachments'

	let {
		w,
		h,
		isEditing,
		rowData,
		columnDefs,
	}: { w: number; h: number; isEditing: boolean; rowData: unknown[]; columnDefs: ColDef[] } =
		$props()

	// [3]
	const isReady = delaySvgExport()

	let api: GridApi | undefined

	// Mounts the grid once (replaces `<AgGridReact>`); `onGridReady` releases the export delay.
	const grid: Attachment<HTMLDivElement> = (element) => {
		api = createGrid(element, {
			onGridReady: isReady,
			rowData,
			columnDefs,
		})
		return () => {
			api?.destroy()
			api = undefined
		}
	}

	// Push later prop changes into the live grid.
	$effect(() => {
		api?.setGridOption('rowData', rowData)
	})
	$effect(() => {
		api?.setGridOption('columnDefs', columnDefs)
	})
</script>

<div
	style:width="{w}px"
	style:height="{h}px"
	style:pointer-events={isEditing ? 'all' : undefined}
	class="ag-theme-quartz"
	{@attach grid}
></div>
