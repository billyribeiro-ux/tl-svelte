<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { FlowchartShapeUtil } from './customMermaidShapeUtil'
	import './custom-shape-mermaid.css'
	import CustomMermaidTopPanel from './CustomMermaidTopPanel.svelte'

	const components: TLComponents = {
		TopPanel: CustomMermaidTopPanel,
	}

	const customShapes = [FlowchartShapeUtil]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} shapeUtils={customShapes} />
</div>
