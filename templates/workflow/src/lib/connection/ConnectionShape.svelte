<script lang="ts">
	import classNames from 'classnames'
	import { SVGContainer, fromComputed, getEditor } from 'svelte-draw'
	import { getNodeOutputPortInfo } from '../nodes/nodePorts'
	import { STOP_EXECUTION } from '../nodes/types/shared'
	import { getConnectionBindings } from './ConnectionBindingUtil'
	import {
		getConnectionPath,
		getConnectionTerminals,
		type ConnectionShape,
	} from './ConnectionShapeUtil'

	// Main connection component that renders the SVG path
	let { connection }: { connection: ConnectionShape } = $props()

	const editor = getEditor()

	// Get the connection terminals
	// Re-read the shape from the store inside the computed: the `connection` prop is only a snapshot, and
	// a Svelte prop change doesn't invalidate a signal-backed computed (React's `useValue` had
	// `connection` in its deps for this).
	const terminals = fromComputed('terminals', () =>
		getConnectionTerminals(editor, editor.getShape<ConnectionShape>(connection.id) ?? connection)
	)

	// Check if this connection is inactive (carrying STOP_EXECUTION signal)
	const isInactive = fromComputed('isInactive', () => {
		const bindings = getConnectionBindings(editor, connection.id)
		if (!bindings.start) return false
		const originShapeId = bindings.start?.toId
		if (!originShapeId) return false
		const outputs = getNodeOutputPortInfo(editor, originShapeId)
		const output = outputs[bindings.start.props.portId]
		return output.value === STOP_EXECUTION
	})
</script>

<SVGContainer class={classNames('ConnectionShape', isInactive.current && 'ConnectionShape_inactive')}>
	<path d={getConnectionPath(terminals.current.start, terminals.current.end)} />
</SVGContainer>
