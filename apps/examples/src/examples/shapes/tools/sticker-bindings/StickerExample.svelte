<script lang="ts">
	import {
		SvelteDraw,
		type TLComponents,
		type TLUiAssetUrlOverrides,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import StickerToolbar from './StickerToolbar.svelte'
	import { StickerBindingUtil, StickerShapeUtil, StickerTool } from './StickerUtils'

	// There's a guide at the bottom of StickerUtils.ts!

	const overrides: TLUiOverrides = {
		tools(editor, tools) {
			tools['sticker'] = {
				id: 'sticker',
				label: 'Sticker',
				icon: 'heart-icon',
				kbd: 'p',
				onSelect: () => {
					editor.setCurrentTool('sticker')
				},
			}
			return tools
		},
	}

	const assetUrls: TLUiAssetUrlOverrides = {
		icons: {
			'heart-icon': '/heart-icon.svg',
		},
	}

	const components: TLComponents = {
		Toolbar: StickerToolbar,
	}

	const shapeUtils = [StickerShapeUtil]
	const bindingUtils = [StickerBindingUtil]
	const tools = [StickerTool]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {bindingUtils} {tools} {overrides} {assetUrls} {components} />
</div>
