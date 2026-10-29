<script lang="ts">
	import { type Editor, SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomStylePanel from './CustomStylePanel.svelte'
	import { MyShapeUtil } from './CustomStylesShapeUtil'

	// [7]
	const shapeUtils = [MyShapeUtil]
	const components: TLComponents = {
		StylePanel: CustomStylePanel,
	}

	function onMount(editor: Editor) {
		// [8]
		editor.createShape({ type: 'myshapewithcustomstyles', x: 100, y: 100 })
		editor.selectAll()
		editor.createShape({
			type: 'myshapewithcustomstyles',
			x: 450,
			y: 250,
			props: { rating: 5 },
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {components} {onMount} />
</div>
