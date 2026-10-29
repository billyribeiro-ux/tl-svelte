<script lang="ts">
	import { FrameShapeUtil, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	const shapeUtils = [FrameShapeUtil.configure({ showColors: true })]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="frame-colors" {shapeUtils} />
</div>
