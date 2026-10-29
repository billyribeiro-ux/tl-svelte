<script lang="ts">
	import { SvelteDraw, type TLStoreSnapshot } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { ContainerShapeUtil, ElementShapeUtil, LayoutBindingUtil } from './LayoutUtils'
	import snapshot from './snapshot.json'

	// There's a guide at the bottom of LayoutUtils.ts!

	const shapeUtils = [ContainerShapeUtil, ElementShapeUtil]
	const bindingUtils = [LayoutBindingUtil]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		snapshot={snapshot as unknown as TLStoreSnapshot}
		{shapeUtils}
		{bindingUtils}
	/>
</div>
