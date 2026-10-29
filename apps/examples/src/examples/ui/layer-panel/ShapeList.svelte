<script lang="ts" module>
	import type { TLShapeId } from 'svelte-draw'

	export interface ShapeListProps {
		shapeIds: TLShapeId[]
		depth: number
		parentIsSelected?: boolean
		parentIsHidden?: boolean
	}
</script>

<script lang="ts">
	import ShapeItem from './ShapeItem.svelte'

	let { shapeIds, depth, parentIsSelected, parentIsHidden }: ShapeListProps = $props()
</script>

{#if shapeIds.length}
	<div class="shape-tree">
		{#each shapeIds as shapeId (shapeId)}
			<ShapeItem {shapeId} {depth} {parentIsHidden} {parentIsSelected} />
		{/each}
	</div>
{/if}
