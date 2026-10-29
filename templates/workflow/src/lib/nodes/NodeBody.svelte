<script lang="ts">
	import type { NodeShape } from './NodeShapeUtil'
	import { nodeComponents } from './nodeComponents'

	let { shape }: { shape: NodeShape } = $props()

	const node = $derived(shape.props.node)
	const NodeComponent = $derived(nodeComponents[node.type])
</script>

<NodeComponent {shape} {node} />
