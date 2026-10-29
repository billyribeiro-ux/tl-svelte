<script lang="ts">
	import { fromComputed, getEditor, getTranslation, SvelteDrawUiButton } from 'svelte-draw'

	// [1]
	const editor = getEditor()
	const msg = getTranslation()
	const selectedCount = fromComputed('selected count', () => editor.getSelectedShapeIds().length)
</script>

<div class="tlui-menu custom-language-toolbar">
	<!-- [2] -->
	<span class="custom-language-count">
		{msg('example.selected', { count: selectedCount.current })}
	</span>
	<SvelteDrawUiButton
		type="normal"
		onclick={() => editor.duplicateShapes(editor.getSelectedShapeIds())}
	>
		<!-- [3] -->
		{msg('action.duplicate')}
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={() => editor.deleteShapes(editor.getSelectedShapeIds())}>
		{msg('action.delete')}
	</SvelteDrawUiButton>
</div>
