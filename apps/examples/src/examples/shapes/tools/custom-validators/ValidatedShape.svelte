<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'

	let { id, percentage, rating }: { id: TLShapeId; percentage: number; rating: number } = $props()
</script>

<HTMLContainer {id} style="padding: 16px; pointer-events: all;">
	<div>Percentage: {percentage}%</div>
	<div>Rating: {rating}/5</div>
</HTMLContainer>
