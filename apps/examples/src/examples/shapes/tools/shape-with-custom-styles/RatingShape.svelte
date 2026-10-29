<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'

	let { id, stars }: { id: TLShapeId; stars: string[] } = $props()
</script>

<HTMLContainer {id} style="background-color: var(--tl-color-low-border); overflow: hidden;">
	{stars.join('')}
</HTMLContainer>
