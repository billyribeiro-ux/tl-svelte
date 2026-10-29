<script lang="ts">
	import { createSyncDemo } from '@svelte-draw/sync'
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CounterToolbar from './CounterToolbar.svelte'
	import { CounterShapeTool, CounterShapeUtil } from './CounterShape'
	import { uiOverrides } from './ui'

	let { roomId }: { roomId?: string } = $props()

	const customShapes = [CounterShapeUtil]
	const customTools = [CounterShapeTool]
	const components: TLComponents = { Toolbar: CounterToolbar }

	// The store needs the shape utils too, so it can validate and migrate counter shapes that arrive
	// from other clients.
	const sync = createSyncDemo(() => ({ roomId: roomId!, shapeUtils: customShapes }))
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		store={sync.current}
		shapeUtils={customShapes}
		tools={customTools}
		overrides={uiOverrides}
		{components}
		options={{ deepLinks: true }}
	/>
</div>
