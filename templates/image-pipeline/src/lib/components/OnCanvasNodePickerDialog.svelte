<script lang="ts">
	import { Dialog } from 'bits-ui'
	import type { Snippet } from 'svelte'
	import {
		fromComputed,
		getEditor,
		quickReactor,
		SvelteDrawUiMenuContextProvider,
		usePassThroughWheelEvents,
		Vec,
	} from 'svelte-draw'
	import { getConnectionTerminals } from '../connection/ConnectionShapeUtil'
	import { NODE_WIDTH_PX } from '../constants'
	import { onCanvasNodePickerState } from './onCanvasNodePickerState'

	let { children, onClose }: { children: Snippet; onClose: () => void } = $props()

	const editor = getEditor()
	const location = fromComputed('location', () => onCanvasNodePickerState.get(editor)?.location)
	const shouldRender = $derived(!!location.current)
	let container = $state<HTMLElement | null>(null)
	const passThroughWheelEvents = usePassThroughWheelEvents()

	// Keeps the picker glued to the connection's terminal while the camera or the shapes move.
	$effect(() => {
		const element = container
		return quickReactor('OnCanvasNodePicker', () => {
			const state = onCanvasNodePickerState.get(editor)
			if (!state) return

			if (!element) return

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

			const terminalInViewportSpace = editor.pageToViewport(terminalInPageSpace)
			element.style.transform = `translate(${terminalInViewportSpace.x}px, ${terminalInViewportSpace.y}px) scale(${editor.getZoomLevel()}) `
		})
	})
</script>

<!-- A non-modal dialog: no focus trap and no scroll lock, like Radix's `modal={false}`. -->
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
		class={`OnCanvasNodePicker OnCanvasNodePicker_${location.current}`}
		style={`width: ${NODE_WIDTH_PX}px`}
		{@attach passThroughWheelEvents}
	>
		<div class="OnCanvasNodePicker-content">
			<!-- Visually hidden, but still the dialog's accessible name. -->
			<Dialog.Title
				style="position: absolute; border: 0; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; word-wrap: normal"
			>
				Insert node
			</Dialog.Title>
			<SvelteDrawUiMenuContextProvider sourceId="dialog" type="menu">
				{@render children()}
			</SvelteDrawUiMenuContextProvider>
		</div>
	</Dialog.Content>
</Dialog.Root>
