<script lang="ts">
	import type { RecordsDiff, TLComponents, TLRecord } from 'svelte-draw'
	import { getDiffShapesFromDiff } from './diffShapes'
	import DiffShapeWrapper from './DiffShapeWrapper.svelte'
	import SvelteDrawViewer from './SvelteDrawViewer.svelte'

	let { diff }: { diff: RecordsDiff<TLRecord> } = $props()

	const diffShapes = $derived(getDiffShapesFromDiff(diff))
	const components: TLComponents = { ShapeWrapper: DiffShapeWrapper }
</script>

<SvelteDrawViewer shapes={diffShapes} {components} />
