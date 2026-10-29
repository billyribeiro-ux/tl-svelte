<script lang="ts">
	import { commentsSidebarOpen, toggleCommentsSidebar } from '@svelte-draw/commenting'
	import {
		fromComputed,
		getEditor,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
	} from 'svelte-draw'

	// The host supplies the sidebar's open/close affordance. Here it's a button in the share-panel
	// slot. The comment tool closes the sidebar when it activates, so the button is how it comes back.
	const editor = getEditor()
	const open = fromComputed('sidebar open', () => commentsSidebarOpen.get(editor))
</script>

<div style="pointer-events: all; display: flex; padding: 4px;">
	<SvelteDrawUiButton type="normal" onclick={() => toggleCommentsSidebar(editor)}>
		<SvelteDrawUiButtonLabel>{open.current ? 'Hide comments' : 'Comments'}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</div>
