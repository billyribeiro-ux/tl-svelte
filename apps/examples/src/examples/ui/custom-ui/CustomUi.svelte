<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	// [2]
	const editor = getEditor()
	const currentToolId = fromComputed('current tool id', () => editor.getCurrentToolId())

	$effect(() => {
		const handleKeyUp = (e: KeyboardEvent) => {
			if (editor.getEditingShapeId() !== null) return
			const target = e.target as HTMLElement | null
			if (target?.isContentEditable) return
			if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return

			switch (e.key) {
				case 'Delete':
				case 'Backspace': {
					editor.deleteShapes(editor.getSelectedShapeIds())
					break
				}
				case 'v': {
					editor.setCurrentTool('select')
					break
				}
				case 'e': {
					editor.setCurrentTool('eraser')
					break
				}
				case 'x':
				case 'p':
				case 'b':
				case 'd': {
					editor.setCurrentTool('draw')
					break
				}
			}
		}

		window.addEventListener('keyup', handleKeyUp)
		return () => {
			window.removeEventListener('keyup', handleKeyUp)
		}
	})
</script>

<div class="custom-layout">
	<div class="custom-toolbar">
		<button
			class="custom-button"
			data-isactive={currentToolId.current === 'select'}
			onclick={() => editor.setCurrentTool('select')}
		>
			Select
		</button>
		<button
			class="custom-button"
			data-isactive={currentToolId.current === 'draw'}
			onclick={() => editor.setCurrentTool('draw')}
		>
			Pencil
		</button>
		<button
			class="custom-button"
			data-isactive={currentToolId.current === 'eraser'}
			onclick={() => editor.setCurrentTool('eraser')}
		>
			Eraser
		</button>
	</div>
</div>

<!--
[2]
`editor.getCurrentToolId()` is a signal read, so it goes through `fromComputed` to re-render the
active button when the tool changes. See the signals example for more:
https://svelte-draw.invalid/examples/signals

We get the editor via `getEditor` and add a window `keyup` listener for our own shortcuts. The
listener skips key presses while a shape is being edited or when an input has focus, so typing text
doesn't switch tools.
-->
