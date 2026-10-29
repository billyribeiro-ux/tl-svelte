<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import type { NodeShape } from './NodeShapeUtil'
	import { getNodeDefinition } from './nodeTypes'

	let { shape }: { shape: NodeShape } = $props()

	const editor = getEditor()
	const node = $derived(shape.props.node)
	const Component = $derived(getNodeDefinition(editor, node).Component)
</script>

<Component {shape} {node} />
