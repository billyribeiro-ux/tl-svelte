<script lang="ts">
	import { SVGContainer, getEditor } from 'svelte-draw'
	import { reactiveComputed } from '../reactiveComputed.svelte'
	import { getConnectionPath, getConnectionTerminals, type ConnectionShape } from './ConnectionShapeUtil'

	// Main connection component that renders the SVG path
	let { connection }: { connection: ConnectionShape } = $props()

	const editor = getEditor()

	// Get the connection terminals
	const terminals = reactiveComputed(
		'terminals',
		() => connection,
		(connection) => getConnectionTerminals(editor, connection)
	)
</script>

<SVGContainer class="ConnectionShape">
	<path d={getConnectionPath(terminals.current.start, terminals.current.end)} />
</SVGContainer>
