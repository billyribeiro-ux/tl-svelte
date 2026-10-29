<script lang="ts">
	import { HTMLContainer, getEditor } from 'svelte-draw'
	import Port from '../ports/Port.svelte'
	import { reactiveComputed } from '../reactiveComputed.svelte'
	import type { NodeShape } from './NodeShapeUtil'
	import { getNodeDefinition, getNodeHeightPx, getNodeTypePorts, getNodeWidthPx } from './nodeTypes'

	// Main node component that renders the HTML content
	let { shape }: { shape: NodeShape } = $props()

	const editor = getEditor()

	const node = $derived(shape.props.node)
	const Body = $derived(getNodeDefinition(editor, node).Component)

	const ports = reactiveComputed(
		'node ports',
		() => shape,
		(shape) => getNodeTypePorts(editor, shape)
	)
</script>

<HTMLContainer
	class="NodeShape"
	style="width: {getNodeWidthPx(editor, shape)}px; height: {getNodeHeightPx(editor, shape)}px;"
>
	<Body {shape} {node} />
	{#each Object.values(ports.current) as port (port.id)}
		<Port shapeId={shape.id} {port} />
	{/each}
</HTMLContainer>
