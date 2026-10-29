import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'

export type {
	DiagramMermaidBlueprint,
	MermaidBlueprintEdge,
	MermaidBlueprintLineNode,
	MermaidBlueprintNode,
	MermaidBlueprintNodeRenderSpec,
	MermaidDiagramKind,
	MermaidNodeRenderMapper,
} from './blueprint'
export { createMermaidDiagram, MermaidDiagramError } from './createMermaidDiagram'
export type { MermaidDiagramOptions } from './createMermaidDiagram'
export {
	defaultMermaidNodeRenderSpec,
	resolveMermaidNodeRender,
} from './defaultMermaidNodeRenderSpec'
export { MERMAID_MINDMAP_NODE_TYPE } from './mindmapDiagram'
export {
	defaultCreateMermaidNodeFromBlueprint,
	type MermaidNodeCreateFunctionArgs,
} from './mermaidNodeCreateShape'
export { renderBlueprint } from './renderBlueprint'
export type { BlueprintRenderingOptions } from './renderBlueprint'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
