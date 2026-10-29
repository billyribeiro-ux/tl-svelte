<script lang="ts">
	import {
		DefaultFillStyle,
		type Editor,
		SvelteDraw,
		type TLComponents,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { penIcon } from './PenIcon.svelte'
	import { PenHandleOverlayUtil, PenShapeUtil } from './PenShapeUtil'
	import { PenTool } from './PenTool'
	import PenToolbar from './PenToolbar.svelte'

	const overrides: TLUiOverrides = {
		tools(editor, tools) {
			tools.pen = {
				id: 'pen',
				label: 'Pen',
				icon: penIcon,
				kbd: 'p',
				onSelect: () => editor.setCurrentTool('pen.drawing'),
			}
			return tools
		},
	}

	const components: TLComponents = {
		Toolbar: PenToolbar,
	}

	const shapeUtils = [PenShapeUtil]
	const tools = [PenTool]
	const overlayUtils = [PenHandleOverlayUtil]

	function onMount(editor: Editor) {
		editor.setStyleForNextShapes(DefaultFillStyle, 'solid')
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{shapeUtils}
		{tools}
		{overlayUtils}
		{overrides}
		{components}
		initialState="pen"
		{onMount}
	/>
</div>
