<script lang="ts">
	import { fromComputed, getEditor, type TLShapeId } from 'svelte-draw'
	import { PORT_TYPE_COLORS } from '../constants'
	import { getNodePorts } from '../nodes/nodePorts'
	import type { PortId } from './Port'
	import { portState } from './portState'

	/**
	 * Renders a port with its data-type color.
	 */
	let { shapeId, portId }: { shapeId: TLShapeId; portId: PortId } = $props()

	const editor = getEditor()

	// Each computed is re-created when the props change so it follows the new shape/port.
	const portValue = $derived(
		fromComputed('port', () => {
			const shape = editor.getShape(shapeId)
			if (!shape || !editor.isShapeOfType(shape, 'node')) return null
			return getNodePorts(editor, shape)?.[portId]
		})
	)
	// Throws (and so reaches the shape's error boundary) whenever the port is missing, like the
	// React component threw on every render.
	const port = $derived.by(() => {
		const value = portValue.current
		if (!value) throw new Error(`Port ${portId} not found on shape ${shapeId}`)
		return value
	})

	const isHinting = $derived(
		fromComputed('isHinting', () => {
			const { hintingPort } = portState.get(editor)
			return !!hintingPort && hintingPort.portId === portId && hintingPort.shapeId === shapeId
		})
	)

	const isEligible = $derived(
		fromComputed('isEligible', () => {
			const { eligiblePorts } = portState.get(editor)
			if (!eligiblePorts) return false
			if (eligiblePorts.terminal !== port.terminal) return false
			if (eligiblePorts.excludeNodes?.has(shapeId)) return false
			// type compatibility: 'any' matches everything, otherwise types must match
			if (
				eligiblePorts.dataType &&
				eligiblePorts.dataType !== 'any' &&
				port.dataType !== 'any' &&
				eligiblePorts.dataType !== port.dataType
			)
				return false
			return true
		})
	)

	const color = $derived(PORT_TYPE_COLORS[port.dataType])
</script>

<!--
	Not a native listener: this handler neither stops propagation nor marks the event as handled, so
	the delegated `onpointerdown` is fine.
-->
<div
	role="presentation"
	class={[
		'Port',
		`Port_${port.terminal}`,
		isHinting.current ? 'Port_hinting' : isEligible.current ? 'Port_eligible' : undefined,
	]}
	style:--port-color={color}
	onpointerdown={() => {
		editor.setCurrentTool('select.pointing_port', {
			shapeId,
			portId,
			terminal: port.terminal,
			dataType: port.dataType,
		})
	}}
></div>
