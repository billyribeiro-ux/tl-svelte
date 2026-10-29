<script lang="ts">
	import { Box, getEditor, SvelteDrawUiButton } from 'svelte-draw'
	import { zoomBox1, zoomBox2 } from './boxes'

	const editor = getEditor()
</script>

<div class="tlui-menu control-panel">
	<!-- [1] -->
	<SvelteDrawUiButton type="normal" onclick={() => editor.zoomToBounds(zoomBox1, { inset: 72 })}>
		Zoom to violet box
	</SvelteDrawUiButton>
	<SvelteDrawUiButton
		type="normal"
		onclick={() => editor.zoomToBounds(zoomBox2, { inset: 72, animation: { duration: 200 } })}
	>
		Zoom to blue box
	</SvelteDrawUiButton>
	<SvelteDrawUiButton
		type="normal"
		onclick={() =>
			editor.zoomToBounds(Box.Common([zoomBox1, zoomBox2]), {
				inset: 200,
				animation: { duration: 200 },
			})}
	>
		Zoom to both boxes
	</SvelteDrawUiButton>
</div>
