<script lang="ts" module>
	import { SvelteDraw, type TLUiComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import ExportCanvasButton from './ExportCanvasButton.svelte'

	const components: TLUiComponents = {
		SharePanel: ExportCanvasButton,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>
