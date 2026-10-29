<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { getIsCoarsePointer } from '../../../utils/getIsCoarsePointer'

	const editor = getEditor()

	$effect(() => {
		const pageHasShapes = editor.getCurrentPageShapeIds().size > 0
		// If the editor is in coarse pointer mode and there are some shapes on the current page,
		// start on the hand tool to avoid accidental selections / drags as the user tries to
		// orient themselves or move around the page
		if (getIsCoarsePointer() && pageHasShapes) {
			editor.setCurrentTool('hand')
		}

		// todo: if the user has never been to this page before on this device (how?) and they're on an empty part of it, do a "back to content"  automatically
	})
</script>
