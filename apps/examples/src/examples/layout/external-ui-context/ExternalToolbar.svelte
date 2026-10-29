<script lang="ts">
	import { fromComputed, GeoShapeGeoStyle } from 'svelte-draw'
	import { getExternalEditor } from './editorContext'

	// [4]
	// Any descendant of the provider can read the editor from context. `fromComputed` keeps
	// the active button in sync with the current tool.
	const editor = getExternalEditor()

	const currentToolId = fromComputed('current tool id', () => editor.getCurrentToolId())
	const isOvalStyle = fromComputed(
		'oval style',
		() => editor.getStyleForNextShape(GeoShapeGeoStyle) === 'oval'
	)
</script>

<div>
	<div class="external-toolbar">
		<button
			class="external-button"
			data-isactive={currentToolId.current === 'select'}
			onclick={() => editor.setCurrentTool('select')}
		>
			Select
		</button>
		<button
			class="external-button"
			data-isactive={currentToolId.current === 'draw'}
			onclick={() => editor.setCurrentTool('draw')}
		>
			Pencil
		</button>
		<button
			class="external-button"
			data-isactive={currentToolId.current === 'geo' && isOvalStyle.current}
			onclick={() => {
				// [5]
				// The geo tool creates whichever geo shape is set in `GeoShapeGeoStyle`, so set the
				// style first, then switch tools. `editor.run` batches the two updates together.
				editor.run(() => {
					editor.setStyleForNextShapes(GeoShapeGeoStyle, 'oval')
					editor.setCurrentTool('geo')
				})
			}}
		>
			Oval
		</button>
	</div>
</div>
