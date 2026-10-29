import type { Component } from 'svelte'
import type { NodeDefinitions } from './nodeTypes'
import AddNodeComponent from './types/AddNodeComponent.svelte'
import ConditionalNodeComponent from './types/ConditionalNodeComponent.svelte'
import DivideNodeComponent from './types/DivideNodeComponent.svelte'
import EarthquakeNodeComponent from './types/EarthquakeNodeComponent.svelte'
import MultiplyNodeComponent from './types/MultiplyNodeComponent.svelte'
import type { NodeComponentProps } from './types/shared'
import SliderNodeComponent from './types/SliderNodeComponent.svelte'
import SubtractNodeComponent from './types/SubtractNodeComponent.svelte'

/**
 * The Svelte component that renders the body of each node type.
 *
 * This lives apart from the node definitions on purpose: the components import the port and node
 * helpers, which import the definitions. Having the definitions import their components closed that
 * import cycle through the definition classes, and in the production bundle `NodeType` was then
 * built from definitions that had not been initialised yet (every node failed validation).
 */
export const nodeComponents: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[K in keyof typeof NodeDefinitions]: Component<NodeComponentProps<any>>
} = {
	add: AddNodeComponent,
	subtract: SubtractNodeComponent,
	multiply: MultiplyNodeComponent,
	divide: DivideNodeComponent,
	conditional: ConditionalNodeComponent,
	slider: SliderNodeComponent,
	earthquake: EarthquakeNodeComponent,
}
