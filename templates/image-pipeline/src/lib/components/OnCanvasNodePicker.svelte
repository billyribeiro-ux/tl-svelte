<script lang="ts">
	import { getEditor, SvelteDrawUiMenuGroup } from 'svelte-draw'
	import { getNodeDefinitions } from '../nodes/nodeTypes'
	import { onCanvasNodePickerState } from './onCanvasNodePickerState'
	import OnCanvasNodePickerDialog from './OnCanvasNodePickerDialog.svelte'
	import OnCanvasNodePickerItem from './OnCanvasNodePickerItem.svelte'

	const editor = getEditor()

	function onClose() {
		const state = onCanvasNodePickerState.get(editor)
		if (!state) return
		onCanvasNodePickerState.set(editor, null)
		state.onClose()
	}

	const nodeDefs = getNodeDefinitions(editor)
</script>

<OnCanvasNodePickerDialog {onClose}>
	<SvelteDrawUiMenuGroup id="inputs">
		<OnCanvasNodePickerItem definition={nodeDefs.model} {onClose} />
		<OnCanvasNodePickerItem definition={nodeDefs.prompt} {onClose} />
		<OnCanvasNodePickerItem definition={nodeDefs.load_image} {onClose} />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="process">
		<OnCanvasNodePickerItem definition={nodeDefs.generate} {onClose} />
		<OnCanvasNodePickerItem definition={nodeDefs.controlnet} {onClose} />
		<OnCanvasNodePickerItem definition={nodeDefs.blend} {onClose} />
		<OnCanvasNodePickerItem definition={nodeDefs.adjust} {onClose} />
		<OnCanvasNodePickerItem definition={nodeDefs.prompt_concat} {onClose} />
	</SvelteDrawUiMenuGroup>
	<SvelteDrawUiMenuGroup id="output">
		<OnCanvasNodePickerItem definition={nodeDefs.preview} {onClose} />
	</SvelteDrawUiMenuGroup>
</OnCanvasNodePickerDialog>
