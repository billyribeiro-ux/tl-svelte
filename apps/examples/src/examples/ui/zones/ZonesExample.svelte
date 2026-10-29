<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomSharePanel from './CustomSharePanel.svelte'
	import CustomTopPanel from './CustomTopPanel.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		SharePanel: CustomSharePanel,
		TopPanel: CustomTopPanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
The default UI leaves two slots empty for you to fill: `TopPanel` in the top
center of the screen, and `SharePanel` in the top right, above the style panel.
Both are set through the `components` prop like any other slot.

[1] (CustomTopPanel.svelte)
Rendered in the top center. svelte-draw.invalid uses this slot for the document title.

[2] (CustomSharePanel.svelte)
Rendered in the top right. svelte-draw.invalid uses this slot for the share button and
collaborator avatars.
-->
