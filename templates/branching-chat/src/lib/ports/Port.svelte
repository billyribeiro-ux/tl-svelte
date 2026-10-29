<script lang="ts">
	import { getEditor, nativeEvents, type TLShapeId } from 'svelte-draw'
	import { getNodePortConnections } from '../nodes/nodePorts'
	import { reactiveComputed } from '../reactiveComputed.svelte'
	import { portState } from './portState'
	import type { ShapePort } from './types'

	/**
	 * This component renders a port.
	 */
	let { shapeId, port }: { shapeId: TLShapeId; port: ShapePort } = $props()

	const editor = getEditor()

	// isHinting is true if the user is currently dragging a connection to this port. it means we
	// should highlight this port.
	const isHinting = reactiveComputed(
		'isHinting',
		() => ({ shapeId, portId: port.id }),
		({ shapeId, portId }) => {
			const { hintingPort } = portState.get(editor)
			return !!hintingPort && hintingPort.portId === portId && hintingPort.shapeId === shapeId
		}
	)

	// isEligible is true if the the user is currently dragging a connection, and this port is one
	// that the connection can be connected to.
	const isEligible = reactiveComputed(
		'isEligible',
		() => ({ shapeId, portId: port.id, terminal: port.terminal }),
		({ shapeId, portId, terminal }) => {
			const { eligiblePorts } = portState.get(editor)
			if (!eligiblePorts) return false
			if (eligiblePorts.terminal !== terminal) return false
			if (eligiblePorts.excludeNodes?.has(shapeId)) return false
			if (terminal === 'end') {
				// if the port is an end port, it can only have one connection, so it's not eligible
				// when there is a connection
				const connections = getNodePortConnections(editor, shapeId)
				return !connections.some((c) => c.ownPortId === portId)
			}
			return true
		}
	)

	// A native listener, not `onpointerdown`: the port is a child of the canvas, so its handler has to
	// run before the editor's own pointer handling, the way a React child's handler ran before the
	// canvas's.
	function pointerdown() {
		editor.setCurrentTool('select.pointing_port', {
			shapeId,
			portId: port.id,
			terminal: port.terminal,
		})
	}
</script>

<div
	class={[
		'Port',
		isHinting.current ? 'Port_hinting' : isEligible.current ? 'Port_eligible' : undefined,
	]}
	style:transform="translate({port.x}px, {port.y}px)"
	role="presentation"
	{@attach nativeEvents({ pointerdown })}
></div>
