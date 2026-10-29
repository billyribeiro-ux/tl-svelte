<script lang="ts" generics="T extends NodeType">
	import {
		getEditor,
		nativeEvents,
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiButtonLabel,
		Vec,
	} from 'svelte-draw'
	import { getConnectionTerminals } from '../connection/ConnectionShapeUtil'
	import type { NodeType } from '../nodes/nodeTypes'
	import type { NodeDefinition } from '../nodes/types/shared'
	import { onCanvasNodePickerState } from './onCanvasNodePickerState'

	let { definition, onClose }: { definition: NodeDefinition<T>; onClose: () => void } = $props()

	const editor = getEditor()

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const markPointerDownAsHandled = nativeEvents({
		pointerdown: (e) => editor.markEventAsHandled(e),
	})
</script>

<!-- Marks pointerdown as handled so the canvas ignores it. -->
<SvelteDrawUiButton
	type="menu"
	class="OnCanvasNodePicker-button"
	{@attach markPointerDownAsHandled}
	onclick={() => {
		const state = onCanvasNodePickerState.get(editor)
		if (!state) return

		const connection = editor.getShape(state.connectionShapeId)
		if (!connection || !editor.isShapeOfType(connection, 'connection')) {
			onClose()
			return
		}

		const terminals = getConnectionTerminals(editor, connection)
		const terminalInConnectionSpace =
			state.location === 'middle'
				? Vec.Lrp(terminals.start, terminals.end, 0.5)
				: terminals[state.location]

		const terminalInPageSpace = editor
			.getShapePageTransform(connection)
			.applyToPoint(terminalInConnectionSpace)

		state.onPick(definition.getDefault(), terminalInPageSpace)

		onClose()
	}}
>
	<SvelteDrawUiButtonIcon icon={definition.icon} />
	<SvelteDrawUiButtonLabel>{definition.title}</SvelteDrawUiButtonLabel>
</SvelteDrawUiButton>
