<script lang="ts">
	import { fromSignal, getEditor, SvelteDrawUiButton } from 'svelte-draw'
	import { HeartTool, isHeartToolEnabled$ } from './HeartTool'

	const editor = getEditor()
	const isHeartToolEnabled = fromSignal(isHeartToolEnabled$)

	function toggleHeartTool() {
		const enabled = isHeartToolEnabled$.get()
		if (enabled) {
			// [6]
			if (editor.getCurrentToolId() === 'heart') {
				editor.setCurrentTool('select')
			}
			editor.removeTool(HeartTool)
		} else {
			// [7]
			editor.setTool(HeartTool)
		}
		isHeartToolEnabled$.set(!enabled)
	}
</script>

<div class="toggle-button-container">
	<SvelteDrawUiButton onclick={toggleHeartTool} type="normal">
		{isHeartToolEnabled.current ? '💔 Remove heart tool' : '💖 Add heart tool'}
	</SvelteDrawUiButton>
</div>
