<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { SpeechBubbleTool } from './SpeechBubble/SpeechBubbleTool'
	import { SpeechBubbleUtil } from './SpeechBubble/SpeechBubbleUtil'
	import { components, customAssetUrls, uiOverrides } from './SpeechBubble/ui-overrides'
	import './customhandles.css'

	// There's a guide at the bottom of this file!

	// [1]
	const shapeUtils = [SpeechBubbleUtil]
	const tools = [SpeechBubbleTool]
</script>

<!-- [2] -->
<div class="svelte-draw__editor">
	<SvelteDraw
		{shapeUtils}
		{tools}
		overrides={uiOverrides}
		assetUrls={customAssetUrls}
		{components}
		persistenceKey="speech-bubble-example"
	/>
</div>

<!--
/*
Use handles when you want user interaction to alter the geometry of a shape. Here a speech bubble
has a handle on the tail so the user can move it. Most of the interesting code is in
SpeechBubbleUtil.ts and helpers.ts.

[1]
The custom shape util and tool arrays are defined once in the script so they don't get
redefined. See SpeechBubbleUtil.ts and SpeechBubbleTool.ts for the definitions.

[2]
We pass the shape util and tool into the SvelteDraw component's `shapeUtils` and `tools` props, plus the
UI overrides, components, and asset urls that add the tool to the toolbar with its own icon. See
ui-overrides.ts for details.
*/
-->
