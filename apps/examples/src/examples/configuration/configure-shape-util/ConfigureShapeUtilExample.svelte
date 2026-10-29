<script lang="ts">
	import { FrameShapeUtil, NoteShapeUtil, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	const shapeUtils = [
		FrameShapeUtil.configure({ showColors: true }),
		NoteShapeUtil.configure({ resizeMode: 'scale' }),
	]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} />
</div>
