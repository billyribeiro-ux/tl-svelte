<script lang="ts">
	import {
		DefaultFillStyle,
		type Editor,
		SvelteDraw,
		type TLComponents,
		type TLUiAssetUrlOverrides,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import PinToolbar from './PinToolbar.svelte'
	import { PinBindingUtil, PinShapeUtil, PinTool } from './PinUtils'

	// There's a guide at the bottom of PinUtils.ts!

	const overrides: TLUiOverrides = {
		tools(editor, schema) {
			schema['pin'] = {
				id: 'pin',
				label: 'Pin',
				icon: 'heart-icon',
				kbd: 'p',
				onSelect: () => {
					editor.setCurrentTool('pin')
				},
			}
			return schema
		},
	}

	const assetUrls: TLUiAssetUrlOverrides = {
		icons: {
			'heart-icon': '/heart-icon.svg',
		},
	}

	const components: TLComponents = {
		Toolbar: PinToolbar,
	}

	const shapeUtils = [PinShapeUtil]
	const bindingUtils = [PinBindingUtil]
	const tools = [PinTool]

	function onMount(editor: Editor) {
		editor.setStyleForNextShapes(DefaultFillStyle, 'semi')
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="pin-example"
		{onMount}
		{shapeUtils}
		{bindingUtils}
		{tools}
		{overrides}
		{assetUrls}
		{components}
	/>
</div>
