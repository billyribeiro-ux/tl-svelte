<script lang="ts">
	import { fromComputed, fromSignal, getEditor } from '@svelte-draw/svelte'
	import {
		DefaultContextMenu,
		DefaultContextMenuContent,
		SvelteDrawUiMenuActionCheckboxItem,
		SvelteDrawUiMenuActionItem,
		SvelteDrawUiMenuGroup,
	} from 'svelte-draw'
	import { trackedShapes } from '../hooks/useDebugging'

	const editor = getEditor()
	const oneShape = fromComputed('develop only selected shape', () => editor.getOnlySelectedShape())
	const selectedShapes = fromComputed('develop selected shapes', () => editor.getSelectedShapes())
	const tracked = fromSignal(trackedShapes)
</script>

<DefaultContextMenu>
	<DefaultContextMenuContent />
	{#if selectedShapes.current.length > 0}
		<SvelteDrawUiMenuGroup id="debugging">
			<SvelteDrawUiMenuActionItem actionId="log-shapes" />
			{#if oneShape.current}
				<SvelteDrawUiMenuActionCheckboxItem
					checked={tracked.current.includes(oneShape.current.id)}
					actionId="track-changes"
				/>
			{/if}
		</SvelteDrawUiMenuGroup>
	{/if}
</DefaultContextMenu>
