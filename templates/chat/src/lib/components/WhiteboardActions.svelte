<script lang="ts">
	import { SvelteDrawUiButton, SvelteDrawUiRow } from 'svelte-draw'
	import { getWhiteboardActions } from './whiteboardContext'

	const actions = getWhiteboardActions()
</script>

<SvelteDrawUiRow class="whiteboard-actions">
	<SvelteDrawUiButton type="normal" onclick={() => actions.onCancel()}>Cancel</SvelteDrawUiButton>
	<SvelteDrawUiButton type="primary" onclick={() => actions.onSave()}>
		{actions.imageId ? 'Save' : 'Add'}
	</SvelteDrawUiButton>
</SvelteDrawUiRow>
