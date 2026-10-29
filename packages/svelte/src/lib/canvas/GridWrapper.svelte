<script lang="ts">
	import { getEditor } from '../context/editor'
	import { fromComputed } from '../state/fromSignal'
	import { getEditorComponents } from './componentsContext'

	const editor = getEditor()
	const components = getEditorComponents()

	const gridSize = fromComputed('gridSize', () => editor.getDocumentSettings().gridSize)
	const camera = fromComputed('camera', () => editor.getCamera())
</script>

{#if components.Grid}
	{@const Grid = components.Grid}
	<Grid x={camera.current.x} y={camera.current.y} z={camera.current.z} size={gridSize.current} />
{/if}
