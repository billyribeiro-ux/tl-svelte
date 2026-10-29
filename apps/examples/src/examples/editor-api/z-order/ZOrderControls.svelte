<script lang="ts">
	import { getEditor, SvelteDrawUiButton } from 'svelte-draw'

	const editor = getEditor()
</script>

<div class="tlui-menu z-order-controls">
	<!-- [1] -->
	<SvelteDrawUiButton type="normal" onclick={() => editor.sendToBack(editor.getSelectedShapeIds())}>
		Send to back
	</SvelteDrawUiButton>
	<SvelteDrawUiButton
		type="normal"
		onclick={() => editor.sendBackward(editor.getSelectedShapeIds())}
	>
		Send backward
	</SvelteDrawUiButton>
	<SvelteDrawUiButton
		type="normal"
		onclick={() => editor.bringForward(editor.getSelectedShapeIds())}
	>
		Bring forward
	</SvelteDrawUiButton>
	<SvelteDrawUiButton
		type="normal"
		onclick={() => editor.bringToFront(editor.getSelectedShapeIds())}
	>
		Bring to front
	</SvelteDrawUiButton>
</div>
