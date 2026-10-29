<script lang="ts">
	import classNames from 'classnames'
	import { fromComputed, getEditor, nativeEvents, type TLShapeId } from 'svelte-draw'
	import { getNodePortConnections, getNodePorts } from '../nodes/nodePorts'
	import type { PortId } from './Port'
	import { portState } from './portState'

	/**
	 * This component renders a port.
	 */
	let { shapeId, portId }: { shapeId: TLShapeId; portId: PortId } = $props()

	const editor = getEditor()

	// get the port from the the node definition:
	const portSignal = fromComputed('port', () => {
		const shape = editor.getShape(shapeId)
		if (!shape || !editor.isShapeOfType(shape, 'node')) return null
		return getNodePorts(editor, shape)?.[portId]
	})
	const port = $derived.by(() => {
		const current = portSignal.current
		if (!current) throw new Error(`Port ${portId} not found on shape ${shapeId}`)
		return current
	})

	// isHinting is true if the user is currently dragging a connection to this port. it means we
	// should highlight this port.
	const isHinting = fromComputed('isHinting', () => {
		const { hintingPort } = portState.get(editor)
		return !!hintingPort && hintingPort.portId === portId && hintingPort.shapeId === shapeId
	})

	// isEligible is true if the the user is currently dragging a connection, and this port is one
	// that the connection can be connected to.
	const isEligible = fromComputed('isEligible', () => {
		const port = getNodePorts(editor, shapeId)?.[portId]
		if (!port) return false
		const { eligiblePorts: eligiblePorts } = portState.get(editor)
		if (!eligiblePorts) return false
		if (eligiblePorts.terminal !== port.terminal) return false
		if (eligiblePorts.excludeNodes?.has(shapeId)) return false
		if (port.terminal === 'end') {
			// if the port is an end port, it can only have one connection, so it's not eligible
			// when there is a connection
			const connections = getNodePortConnections(editor, shapeId)
			return !connections.some((c) => c.ownPortId === portId)
		}
		return true
	})

	// In the React original this was a synthetic `onPointerDown`, which bubbled through the React tree
	// BEFORE the canvas' own React `onPointerDown`: the tool was already `select.pointing_port` when the
	// editor saw the pointer_down. The canvas listeners are native now, and Svelte delegates
	// `onpointerdown` to the app root (after them), so a native listener on the port is what keeps
	// that order.
	const events = nativeEvents({
		pointerdown: () => {
			editor.setCurrentTool('select.pointing_port', {
				shapeId,
				portId,
				terminal: port.terminal,
			})
		},
	})
</script>

<div
	class={classNames(
		`Port Port_${port.terminal}`,
		isHinting.current ? 'Port_hinting' : isEligible.current ? 'Port_eligible' : undefined
	)}
	{@attach events}
></div>
