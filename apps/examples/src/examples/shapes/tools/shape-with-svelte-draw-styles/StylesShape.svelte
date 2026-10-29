<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'

	let { id, fontSize, color }: { id: TLShapeId; fontSize: number; color: string } = $props()
</script>

<HTMLContainer {id} style="background-color: var(--tl-color-low-border); overflow: hidden;">
	<div style:font-size="{fontSize}px" style:color>
		Select the shape and use the style panel to change the font size and color
	</div>
</HTMLContainer>
