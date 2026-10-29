<script lang="ts">
	import { Dialog } from 'bits-ui'
	import {
		SvelteDrawUiMenuContextProvider,
		SvelteDrawUiMenuGroup,
		Vec,
		fromComputed,
		getEditor,
		quickReactor,
		usePassThroughWheelEvents,
	} from 'svelte-draw'
	import { getConnectionTerminals } from '../connection/ConnectionShapeUtil'
	import { NODE_WIDTH_PX } from '../constants'
	import { getNodeDefinitions } from '../nodes/nodeTypes'
	import OnCanvasComponentPickerItem from './OnCanvasComponentPickerItem.svelte'
	import { onCanvasComponentPickerState } from './onCanvasComponentPickerState'

	// Component picker that appears when users drag connection handles without connecting to existing ports
	const editor = getEditor()

	function onClose() {
		const state = onCanvasComponentPickerState.get(editor)
		if (!state) return
		onCanvasComponentPickerState.set(editor, null)
		state.onClose()
	}

	const nodeDefs = getNodeDefinitions(editor)

	// Dialog component that positions itself at the connection terminal
	const location = fromComputed(
		'location',
		() => onCanvasComponentPickerState.get(editor)?.location
	)
	const shouldRender = $derived(!!location.current)
	let container = $state<HTMLElement | null>(null)
	// Allow wheel events to pass through to the canvas
	const passThroughWheelEvents = usePassThroughWheelEvents()

	// Reactively update the dialog position when the connection or viewport changes
	$effect(() => {
		const element = container
		if (!element) return
		return quickReactor('OnCanvasComponentPicker', () => {
			const state = onCanvasComponentPickerState.get(editor)
			if (!state) return

			const connection = editor.getShape(state.connectionShapeId)
			if (!connection || !editor.isShapeOfType(connection, 'connection')) {
				onClose()
				return
			}

			// Get the connection terminals in connection space
			const terminals = getConnectionTerminals(editor, connection)
			const terminalInConnectionSpace =
				state.location === 'middle'
					? Vec.Lrp(terminals.start, terminals.end, 0.5)
					: terminals[state.location]

			// Transform the position from connection space to page space
			const terminalInPageSpace = editor
				.getShapePageTransform(connection)
				.applyToPoint(terminalInConnectionSpace)

			// Transform from page space to viewport space for positioning the dialog
			const terminalInViewportSpace = editor.pageToViewport(terminalInPageSpace)
			element.style.transform = `translate(${terminalInViewportSpace.x}px, ${terminalInViewportSpace.y}px) scale(${editor.getZoomLevel()}) `
		})
	})
</script>

<!--
	`modal={false}` in Radix: no focus trap, no scroll lock, and the rest of the page stays interactive.
	bits-ui has no `modal` prop, so the same is expressed on the content.
-->
<Dialog.Root
	open={shouldRender}
	onOpenChange={(isOpen) => {
		if (!isOpen) onClose()
	}}
>
	<Dialog.Content
		bind:ref={container}
		trapFocus={false}
		preventScroll={false}
		class={`OnCanvasComponentPicker OnCanvasComponentPicker_${location.current}`}
		style={`width: ${NODE_WIDTH_PX}px`}
	>
		<!-- Everything visible lives in this element, so wheel events over the dialog bubble through it. -->
		<div class="OnCanvasComponentPicker-content" {@attach passThroughWheelEvents}>
			<Dialog.Title class="OnCanvasComponentPicker-visuallyHidden">Insert Node</Dialog.Title>
			<SvelteDrawUiMenuContextProvider sourceId="dialog" type="menu">
				<SvelteDrawUiMenuGroup id="math">
					<OnCanvasComponentPickerItem definition={nodeDefs.add} {onClose} />
					<OnCanvasComponentPickerItem definition={nodeDefs.subtract} {onClose} />
					<OnCanvasComponentPickerItem definition={nodeDefs.multiply} {onClose} />
					<OnCanvasComponentPickerItem definition={nodeDefs.divide} {onClose} />
				</SvelteDrawUiMenuGroup>
				<SvelteDrawUiMenuGroup id="logic">
					<OnCanvasComponentPickerItem definition={nodeDefs.conditional} {onClose} />
				</SvelteDrawUiMenuGroup>
			</SvelteDrawUiMenuContextProvider>
		</div>
	</Dialog.Content>
</Dialog.Root>
