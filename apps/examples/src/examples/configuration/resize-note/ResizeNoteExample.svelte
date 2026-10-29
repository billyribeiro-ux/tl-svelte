<script lang="ts">
	import { NoteShapeUtil, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	const shapeUtils = [NoteShapeUtil.configure({ resizeMode: 'scale' })]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="resize-note" {shapeUtils} />
</div>
