<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'

	let { id, w, h, suit }: { id: TLShapeId; w: number; h: number; suit: string } = $props()
</script>

<HTMLContainer
	style="height: {h}px; width: {w}px; background-color: white; box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2); position: relative; display: flex; justify-content: center; align-items: center; padding: 8px;"
	{id}
>
	<span
		style="position: absolute; top: 0; left: 0; display: flex; justify-content: center; align-items: center; height: {h /
			4.5}px; width: {h / 4.5}px; font-size: {h / 5}px;"
	>
		{suit}
	</span>
	<div style="font-size: {h / 3}px;">{suit}</div>
</HTMLContainer>
