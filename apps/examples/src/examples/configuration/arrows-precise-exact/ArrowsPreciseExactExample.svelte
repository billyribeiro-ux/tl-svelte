<script lang="ts">
	import { ArrowShapeUtil, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	const shapeUtils = [
		ArrowShapeUtil.configure({
			shouldBeExact: (editor, isPrecise) => isPrecise,
		}),
	]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} />
</div>
