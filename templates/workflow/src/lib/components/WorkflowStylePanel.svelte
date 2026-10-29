<script lang="ts">
	import { DefaultStylePanel, fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()
	const shouldShowStylePanel = fromComputed(
		'shouldShowStylePanel',
		() =>
			!editor.isIn('select') ||
			editor.getSelectedShapes().some((s) => s.type !== 'node' && s.type !== 'connection')
	)
</script>

{#if shouldShowStylePanel.current}
	<DefaultStylePanel />
{/if}
