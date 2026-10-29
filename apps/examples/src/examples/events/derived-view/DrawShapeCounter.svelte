<script lang="ts">
	import { fromSignal, getEditor } from '@svelte-draw/svelte'
	import { deriveDrawShapeIds } from './deriveDrawShapeIds'

	const editor = getEditor()

	// [1]
	const drawShapeIds = fromSignal(deriveDrawShapeIds(editor))
	const count = $derived(drawShapeIds.current.size)
</script>

<div class="tlui-menu" style="padding: 4px 8px">
	{count} draw shapes in document
</div>
