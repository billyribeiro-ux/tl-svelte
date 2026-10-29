<script lang="ts">
	import { SvelteDraw, type TLUiOverrides } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	// [1]
	const overrides: TLUiOverrides = {
		tools(_editor, tools) {
			delete tools.text
			return tools
		},
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {overrides} />
</div>

<!--
[1]
The `tools` override receives the map of UI tool items and returns the map the
UI should use. Deleting an entry removes the tool from the toolbar, its
keyboard shortcut, and the keyboard shortcuts dialog. The tool itself is still
registered with the editor, so `editor.setCurrentTool('text')` still works.
-->
