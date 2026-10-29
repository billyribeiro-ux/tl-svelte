<script lang="ts">
	/** The view of the custom `card` shape. Tests only. */
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { id, w, h }: { id: string; w: number; h: number } = $props()
</script>

<HTMLContainer
	{id}
	data-testid="card-shape"
	style="border: 1px solid black; display: flex; align-items: center; justify-content: center; pointer-events: all;"
>
	{w.toFixed()}x{h.toFixed()}
</HTMLContainer>
