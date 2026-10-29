<script lang="ts">
	import { getEditor } from 'svelte-draw'

	const editor = getEditor()

	$effect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
				const editingShape = editor.getEditingShape()
				if (!editingShape) return

				if (e.shiftKey) {
					editor.redo()
					editor.setEditingShape(editingShape)
				} else {
					editor.undo()
					editor.setEditingShape(editingShape)
				}
			}
		}

		window.addEventListener('keydown', handleKeydown)
		return () => {
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>
