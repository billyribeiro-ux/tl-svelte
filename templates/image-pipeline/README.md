<div alt style="text-align: center; transform: scale(.5);">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-dark.png" />
		<img alt="svelte-draw" src="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-light.png" />
	</picture>
</div>

This starter kit builds a visual node-graph editor for AI image generation pipelines on top of svelte-draw. Users place nodes on an infinite canvas, wire up typed ports, and run the graph to generate images — similar to ComfyUI, but built with Svelte 5, SvelteKit and svelte-draw.

## Environment setup

Create a `.dev.vars` file in the root directory and add your Replicate API key:

```
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

Without a token, generation requests will fail with an error.

## Local development

Install dependencies with `pnpm install`.

Run the development server with `pnpm dev`. It starts two processes: the SvelteKit client (a client-side SPA, `ssr = false`, built with `@sveltejs/adapter-static`) on `http://localhost:5173/`, and the Cloudflare Worker (`wrangler dev`) on port 8787. Vite proxies `/api/*` to the worker (override the origin with `WORKER_ORIGIN`). You can also run them separately with `pnpm dev:client` and `pnpm dev:worker`.

Open `http://localhost:5173/` in your browser to see the app.

Type-check with `pnpm check` (`svelte-check` for the client, `tsc -p worker` for the worker).

## How it works

This starter kit has 3 main concepts:

1. **Nodes**: Nodes are shapes that accept inputs and produce outputs. There are 16 node types ranging from inputs (Model, Prompt, Load Image) to processing (Generate, ControlNet, Upscale) to display (Preview).
2. **Connections**: A connection joins the output of one node to the input of another. Connections are drawn as bezier curves and are color-coded by data type.
3. **Ports**: Ports are typed endpoints on nodes. Each port has a data type (`image`, `text`, `model`, `number`, `latent`, or `any`) and only compatible ports can be connected.

There are lots of useful interactions the user can take involving these concepts:

- Dragging from a port lets the user create a new connection
- Dragging from a port to empty space opens an on-canvas node picker
- Clicking in the middle of a connection lets the user insert a new node
- Connections enforce type compatibility — you can't connect an image port to a model port
- Cycle detection prevents circular dependencies

The app automatically detects groups of connected nodes and draws region overlays around them with play/stop controls. Each node also has a "play from here" button. The execution engine traverses the graph as a DAG, resolving dependencies and running nodes in order.

## File structure

- **`src/routes/+page.svelte` and `src/lib/App.svelte`:** The page and the main entry-point. Renders the `<SvelteDraw />` component with custom shape utils, a sidebar, and a default starter pipeline (Model → Prompt → Generate → Preview).
- **`src/lib/nodes`:** Everything related to nodes.
  - **`src/lib/nodes/NodeShapeUtil.ts`:** The node shape util, which defines a custom svelte-draw shape for our nodes.
  - **`src/lib/nodes/nodeTypes.ts`:** The registry of all node type definitions.
  - **`src/lib/nodes/nodePorts.ts`:** Helpers for working with the ports on a node and the values flowing through them.
  - **`src/lib/nodes/types/`:** Each node type definition (`XNode.ts`) next to its Svelte component (`XNodeComponent.svelte`). Nodes define their ports, default props, body height and execution logic.
- **`src/lib/connection`:** Everything related to connections.
  - **`src/lib/connection/ConnectionShapeUtil.ts`:** The connection shape util, which renders bezier curves between ports.
  - **`src/lib/connection/ConnectionBindingUtil.ts`:** The connection binding util. Each connection has two bindings — one to the start node, and one to the end node.
  - **`src/lib/connection/insertNodeWithinConnection.ts`:** A helper for inserting a new node in the middle of a connection.
  - **`src/lib/connection/keepConnectionsAtBottom.ts`:** Side effect listeners that keep connections below nodes in the z-order.
- **`src/lib/ports`:** Everything related to ports.
  - **`src/lib/ports/Port.ts` and `Port.svelte`:** Define port types and a Svelte component for rendering them.
  - **`src/lib/ports/PointingPort.ts`:** An entry in svelte-draw's interaction state tree which extends the select tool with custom port interaction behavior.
  - **`src/lib/ports/portCompatibility.ts`:** Type compatibility rules for connecting ports.
- **`src/lib/execution`:** Everything related to running workflows.
  - **`src/lib/execution/ExecutionGraph.ts`:** The DAG execution engine that runs connected node graphs.
  - **`src/lib/execution/executionState.ts`:** Execution state management — tracking which nodes are running, results, and errors.
- **`src/lib/components`:** UI and on-canvas Svelte components.
  - **`src/lib/components/PipelineToolbar.svelte`:** A replacement for svelte-draw's default toolbar, rendered vertically on the left with draggable node types.
  - **`src/lib/components/ImagePipelineSidebar.svelte`:** A sidebar for saved templates and settings.
  - **`src/lib/components/OnCanvasNodePicker.svelte`:** A panel that appears on the canvas when dragging a connection to empty space, letting the user choose a compatible node to insert.
  - **`src/lib/components/PipelineRegions.svelte`:** Finds groups of connected nodes, draws bounding boxes around them, and provides play/stop controls.
- **`src/lib/templates`:** Save and restore reusable subgraphs.
- **`worker/`:** Cloudflare Worker backend.
  - **`worker/worker.ts`:** The main worker entry-point with API routes.
  - **`worker/routes/`:** Route handlers for generate, upscale, style transfer, IP adapter, text generation, and image storage.
  - **`worker/providers/`:** Provider abstractions for Replicate API calls.

## Deployment

This template uses a [Cloudflare Worker](https://developers.cloudflare.com/workers/) backend with [R2](https://developers.cloudflare.com/r2/) for image storage.

To deploy, create an R2 bucket and deploy the worker:

```bash
pnpm exec wrangler r2 bucket create image-pipeline
pnpm exec wrangler secret put REPLICATE_API_TOKEN
pnpm build
pnpm exec wrangler deploy
```

## License

This project is part of the tldraw SDK. It is provided under the [tldraw SDK license](./LICENSE.md).

You can use the tldraw SDK in commercial or non-commercial projects so long as you preserve the "Made with tldraw" watermark on the canvas. To remove the watermark, you can purchase a [business license](https://tldraw.dev/pricing). Visit [tldraw.dev](https://tldraw.dev) to learn more.

## Trademarks

Copyright (c) 2025-present tldraw Inc. The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](./TRADEMARKS.md) for info on acceptable usage.

## Distributions

You can find svelte-draw on npm here.

## Contribution

Found a bug? Please submit an issue.

## Community

Have questions, comments or feedback? [Join our discord](https://discord.gg/rhsyWMUJxd). For the latest news and release notes, visit svelte-draw.invalid.

## Contact

Find us on Twitter/X at @svelte-draw or email us at [mailto:hello@svelte-draw.invalid](hello@svelte-draw.invalid).
