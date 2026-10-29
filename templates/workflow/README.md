<div alt style="text-align: center; transform: scale(.5);">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-dark.png" />
		<img alt="svelte-draw" src="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-light.png" />
	</picture>
</div>

This repo contains a starter-kit for making a workflow type application using svelte-draw.

## Local development

This is a SvelteKit app (Svelte 5, runes mode) running as a browser-only SPA (`ssr = false`).

Install dependencies with `pnpm install`.

Run the development server with `pnpm dev`.

Other commands: `pnpm build` (static build to `build/`), `pnpm preview`, `pnpm test-ci` (vitest) and `pnpm build-types` (`svelte-kit sync` and `svelte-check`).

Open `http://localhost:5173/` in your browser to see the app.

This starter kit has 3 main concepts:

1. Nodes: Nodes are shapes that accept inputs, and produce outputs.
2. Connections: A connection joins the output of one node to the input of another.
3. Ports: Ports are places on nodes that connections can join to.

There are lots of useful interactions the user can take involving these concepts:

- Clicking on an output port lets the user create a new node
- Dragging from a port lets the user create a new connection
- Dragging from an output port lets the user create a new node
- Clicking in the middle of a port lets the user create a new node
- Dragging a connection lets the user connect it to a different node, or disconnect it entirely

We also include a demonstration of how information might flow through a graph of nodes. Nodes update instantly to show their results. There's also a "play" button to show how execution in a real service that was making API calls might work.

## File structure

All app code is under `src/lib`; `src/routes` only mounts `App.svelte`.

- **`src/lib/App.svelte`:** The main entry-point of the app. This renders the `<SvelteDraw />` component and brings in all the customizations the make this a workflow app.
- **`src/lib/nodes`:** Everything related to nodes
  - **`NodeShapeUtil.ts` / `NodeShape.svelte`:** The node shape util, which defines a custom svelte-draw shape for our nodes, and the component it renders with `shapeView`.
  - **`nodePorts.ts`:** Helpers for efficiently working with the ports on a node, and the values flowing through them.
  - **`nodeComponents.ts`:** Maps each node type to the Svelte component for its body. It is separate from the definitions to avoid an import cycle.
  - **`types`:** Each different node type: a definition class (`*Node.ts`) and its body component (`*NodeComponent.svelte`). We have nodes for basic math operations, setting number with a slider, and conditionals.
- **`src/lib/connection`:** Everything related to connections.
  - **`ConnectionShapeUtil.ts` / `ConnectionShape.svelte`:** The connection shape util, which defines a custom svelte-draw shape for our connections.
  - **`ConnectionBindingUtil.ts`:** The connection binding util. A binding is how svelte-draw models relationships between shapes. Each connection has two bindings - one to the start node, and one to the end node.
  - **`insertNodeWithinConnection.ts`:** A helper for inserting a new node in the middle of a connection.
  - **`keepConnectionsAtBottom.ts`:** A set of svelte-draw side effect listeners that make sure connection are below all other shapes in the z-order.
- **`src/lib/ports`:** Everything related to ports.
  - **`Port.ts` / `Port.svelte`:** Defines the types for ports, and a Svelte component for rendering them.
  - **`PointingPort.ts`:** An entry in svelte-draw's interaction state tree which extends the built-in select tool with custom behavior when interacting with ports.
- **`src/lib/execution`:** Everything related to async execution of workflow graphs
  - **`ExecutionGraph.ts`:** The execution graph, which runs workflows.
- **`src/lib/components`:** UI and on-canvas Svelte components.
  - **`WorkflowToolbar.svelte`:** A replacement for svelte-draw's default toolbar. This one renders vertically down the left of the screen, and emphasizes our workflow tools.
  - **`OnCanvasComponentPicker.svelte`:** A panel that appears on the canvas that lets users choose a new node to insert. This is used with some of the on-canvas interactions described above.
  - **`WorkflowRegions.svelte`:** Finds sets of connected nodes that forms workflows, draws a box around them, and provides a "play" button for running the workflow.

## License

This project is provided under the MIT license found here. The tldraw SDK is provided under the [tldraw license](./LICENSE.md).

## Trademarks

Copyright (c) 2024-present tldraw Inc. The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](./TRADEMARKS.md) for info on acceptable usage.

## Distributions

You can find svelte-draw on npm here.

## Contribution

Found a bug? Please submit an issue.

## Community

Have questions, comments or feedback? Join our discord. For the latest news and release notes, visit svelte-draw.invalid.

## Contact

Find us on Twitter/X at @svelte-draw.
