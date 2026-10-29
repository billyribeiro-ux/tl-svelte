<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'
	import { nativeEvents } from '../../../nativeEvents'

	let {
		id,
		width,
		height,
		backgroundColor,
		color,
	}: { id: TLShapeId; width: number; height: number; backgroundColor: string; color: string } =
		$props()

	//[a]
	let count = $state(0)

	// [b] Native listener: Svelte's delegated `onpointerdown` runs after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<HTMLContainer
	{id}
	style="border: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: all; background-color: {backgroundColor}; color: {color};"
>
	<h2>Clicks: {count}</h2>
	<button onclick={() => count++} {@attach stopPointerDown}>
		{width.toFixed()}x{height.toFixed()}
	</button>
</HTMLContainer>
