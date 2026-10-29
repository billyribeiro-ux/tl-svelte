<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'

	let { id, color }: { id: TLShapeId; color: string } = $props()
</script>

<HTMLContainer {id} style="background-color: {color}; box-shadow: 0 0 10px rgba(0,0,0,0.5);"
></HTMLContainer>
