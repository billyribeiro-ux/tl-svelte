<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { isShapeWithLink } from '../../utils/shapes/shapes'
	import type { TLUiDialogProps } from '../context/dialogs'
	import EditLinkDialogInner from './EditLinkDialogInner.svelte'

	let { onClose }: TLUiDialogProps = $props()

	const editor = getEditor()

	// Reads the editor's selection, so it has to go through the signal bridge.
	const selectedShape = fromComputed('edit link selected shape', () => {
		const shape = editor.getOnlySelectedShape()
		return isShapeWithLink(shape) ? shape : null
	})

	// The shape can be deleted or deselected from under the open dialog (a collaborator, or a
	// keypress reaching the canvas). Rendering nothing on its own would leave an empty dialog frame.
	$effect(() => {
		if (!selectedShape.current) onClose()
	})
</script>

{#if selectedShape.current}
	<EditLinkDialogInner {onClose} selectedShape={selectedShape.current} />
{/if}
