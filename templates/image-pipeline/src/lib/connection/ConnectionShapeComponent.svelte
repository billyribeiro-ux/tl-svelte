<script lang="ts">
	import { fromComputed, getEditor, SVGContainer } from 'svelte-draw'
	import { PORT_TYPE_COLORS } from '../constants'
	import { getNodeOutputPortInfo, getPortDataType } from '../nodes/nodePorts'
	import { STOP_EXECUTION } from '../nodes/types/shared'
	import { getConnectionBindings } from './ConnectionBindingUtil'
	import { getConnectionPath, getConnectionTerminals, type ConnectionShape } from './ConnectionShapeUtil'

	let { connection }: { connection: ConnectionShape } = $props()

	const editor = getEditor()

	// Each bridge is re-created when the connection changes so it follows the new shape.
	const terminals = $derived(
		fromComputed('terminals', () => getConnectionTerminals(editor, connection))
	)
	const start = $derived(terminals.current.start)
	const end = $derived(terminals.current.end)

	// Get the data type color for this connection from its start binding
	const connectionColorValue = $derived(
		fromComputed('connectionColor', () => {
			const bindings = getConnectionBindings(editor, connection.id)
			if (!bindings.start) return null
			const dataType = getPortDataType(editor, bindings.start.toId, bindings.start.props.portId)
			return dataType ? PORT_TYPE_COLORS[dataType] : null
		})
	)
	const connectionColor = $derived(connectionColorValue.current)

	const isInactiveValue = $derived(
		fromComputed('isInactive', () => {
			const bindings = getConnectionBindings(editor, connection.id)
			if (!bindings.start) return false
			const originShapeId = bindings.start?.toId
			if (!originShapeId) return false
			const outputs = getNodeOutputPortInfo(editor, originShapeId)
			const output = outputs[bindings.start.props.portId]
			return output?.value === STOP_EXECUTION
		})
	)
	const isInactive = $derived(isInactiveValue.current)
</script>

<SVGContainer class={['ConnectionShape', isInactive && 'ConnectionShape_inactive']}>
	<path d={getConnectionPath(start, end)} style:stroke={connectionColor ?? undefined} />
</SVGContainer>
