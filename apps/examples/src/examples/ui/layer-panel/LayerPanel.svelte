<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import ShapeList from './ShapeList.svelte'

	// [1]
	const editor = getEditor()
	const shapeIds = fromComputed('shapeIds', () =>
		editor.getSortedChildIdsForParent(editor.getCurrentPageId())
	)
</script>

<div class="layer-panel">
	<div class="layer-panel-title">Shapes</div>

	<!-- [2] -->
	<ShapeList shapeIds={shapeIds.current} depth={0} />
</div>
