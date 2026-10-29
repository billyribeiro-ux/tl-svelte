<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import Controls from './Controls.svelte'
	import { generateShapes } from './generateShapes'

	const components: TLComponents = { TopPanel: Controls }
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		onMount={(editor) => {
			generateShapes(editor, 500)
			editor.zoomToFit({ animation: { duration: 0 } })
		}}
		{components}
	/>
</div>
