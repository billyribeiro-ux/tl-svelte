<script lang="ts" generics="T extends NodeType">
	import {
		SvelteDrawUiButton,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiButtonLabel,
		Vec,
		getEditor,
		nativeEvents,
	} from 'svelte-draw'
	import { getConnectionTerminals } from '../connection/ConnectionShapeUtil'
	import type { NodeType } from '../nodes/nodeTypes'
	import type { NodeDefinition } from '../nodes/types/shared'
	import { onCanvasComponentPickerState } from './onCanvasComponentPickerState'

	// Individual menu item for selecting a node type
	let { definition, onClose }: { definition: NodeDefinition<T>; onClose: () => void } =
		$props()

	const editor = getEditor()

	// Marked as handled on the native event, before the editor's own listeners run (a delegated
	// `onpointerdown` runs after them). Attached to the wrapper: the button spreads merged props.
	const events = nativeEvents({
		pointerdown: (e) => editor.markEventAsHandled(e),
	})
</script>

<div class="OnCanvasComponentPicker-item" {@attach events}>
	<SvelteDrawUiButton
		type="menu"
		class="OnCanvasComponentPicker-button"
		onclick={() => {
			const state = onCanvasComponentPickerState.get(editor)
			if (!state) return

			const connection = editor.getShape(state.connectionShapeId)
			if (!connection || !editor.isShapeOfType(connection, 'connection')) {
				onClose()
				return
			}

			// Calculate the position where the new node should be created
			const terminals = getConnectionTerminals(editor, connection)
			const terminalInConnectionSpace =
				state.location === 'middle'
					? Vec.Lrp(terminals.start, terminals.end, 0.5)
					: terminals[state.location]

			// Transform from connection space to page space
			const terminalInPageSpace = editor
				.getShapePageTransform(connection)
				.applyToPoint(terminalInConnectionSpace)

			// Call the pick handler with the node type and position
			state.onPick(definition.getDefault(), terminalInPageSpace)

			onClose()
		}}
	>
		<SvelteDrawUiButtonIcon icon={definition.icon} />
		<SvelteDrawUiButtonLabel>{definition.title}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</div>
