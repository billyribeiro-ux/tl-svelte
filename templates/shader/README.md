<div alt style="text-align: center; transform: scale(.5);">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-dark.png" />
		<img alt="svelte-draw" src="https://raw.githubusercontent.com/svelte-draw/svelte-draw/main/assets/github-hero-light.png" />
	</picture>
</div>

This template demonstrates how to integrate WebGL shaders with svelte-draw, creating dynamic backgrounds that respond to canvas interactions. It includes four complete examples and a reusable `WebGLManager` base class for building custom shader effects.

## Local development

This is a SvelteKit 3 app (a client-side SPA, `ssr = false`, built with `@sveltejs/adapter-static`).

Install dependencies with `pnpm install`.

Run the development server with `pnpm dev`.

Build a static site into `build/` with `pnpm build`, and serve it with `pnpm preview`. Type-check with `pnpm check`.

Open `http://localhost:5173/` in your browser to see the app.

## What's included

- **WebGLManager base class** ([`src/lib/WebGLManager.ts`](src/lib/WebGLManager.ts)) - Handles WebGL lifecycle, viewport synchronization, and animation loop integration with svelte-draw's reactive system
- **Four example shaders** - Fluid simulation, rainbow gradients, dynamic shadows, and a minimal starter template
- **Config panel components** ([`src/lib/config-panel/`](src/lib/config-panel/)) - Pre-built UI controls for adjusting shader parameters with localStorage persistence
- **Full TypeScript support** - Strongly typed throughout

Switch between examples using the toggle buttons in the svelte-draw style panel.

## Examples

### Fluid Simulation

A real-time fluid simulation that creates dynamic flows from shape interactions. Based on Pavel Dobryakov's WebGL fluid implementation.

- Navier-Stokes fluid dynamics
- Shape movements create velocity-based splats
- Configurable physics and visual effects

**See:** [`src/lib/fluid/`](src/lib/fluid/) | [Documentation](src/lib/fluid/fluid.md)

### Rainbow

An animated gradient shader demonstrating time-based effects and uniform management.

**See:** [`src/lib/rainbow/`](src/lib/rainbow/)

### Shadows

Dynamic shadow casting from svelte-draw shapes using raymarching and signed distance fields.

**See:** [`src/lib/shadow/`](src/lib/shadow/)

### Minimal

A bare-bones template for starting new shader projects. Renders a solid color that adapts to dark mode.

**See:** [`src/lib/minimal/`](src/lib/minimal/) | [Documentation](src/lib/minimal/minimal-example.md)

## Architecture

### WebGLManager

The `WebGLManager` class ([`src/lib/WebGLManager.ts`](src/lib/WebGLManager.ts)) provides the foundation for all shader examples. It handles:

- WebGL2 context creation and lifecycle management
- Automatic viewport synchronization with svelte-draw's canvas
- Animation loop with lifecycle hooks: `onInitialize()`, `onUpdate()`, `onRender()`, `onDispose()`
- Quality/resolution management
- Integration with svelte-draw's reactive state system

To create a custom shader, extend `WebGLManager` and implement the lifecycle hooks. See the minimal example for a starting point.

### Config Panel

The config panel system ([`src/lib/config-panel/`](src/lib/config-panel/)) provides reusable UI components for creating interactive shader controls:

- `ConfigPanel` - Collapsible container with reset functionality
- `ConfigPanelSlider` - Numeric slider control
- `ConfigPanelBooleanControl` - Checkbox control

Config values are stored in reactive atoms and automatically persisted to localStorage. See [config-panel.md](src/lib/config-panel/config-panel.md) for usage details.

### Renderer Pattern

Each example follows this pattern:

1. Define a config interface extending `WebGLManagerConfig` in `config.ts`
2. Create a shader manager class extending `WebGLManager`
3. Write GLSL shaders (vertex and fragment)
4. Create a Svelte renderer component that uses `$effect` to initialize the manager once its canvas is bound
5. Build a config panel for live parameter adjustment
6. Register the renderer as svelte-draw's `Background` component

See any of the example directories for complete implementations.

## Creating a custom shader

The fastest way to create a custom shader is to copy the minimal example:

```bash
cp -r src/minimal src/my-shader
```

Then customize the following files:

- `config.ts` - Define your configuration parameters
- `fragment.glsl` / `vertex.glsl` - Write your shader code
- `MyShaderManager.ts` - Extend WebGLManager and implement rendering logic
- `MyRenderer.svelte` - Create the Svelte component
- `MyConfigPanel.svelte` - Build UI controls

Finally, register your shader in [`src/lib/examples.ts`](src/lib/examples.ts).

For a detailed walkthrough, see [src/minimal/minimal-example.md](src/lib/minimal/minimal-example.md).

## Integration with svelte-draw

The `WebGLManager` has direct access to the svelte-draw editor instance, allowing you to:

- Access shapes: `this.editor.getCurrentPageShapes()`
- Listen to shape changes: `this.editor.store.listen()`
- Get camera state: `this.editor.getCamera()`
- Convert coordinates: `this.editor.pageToViewport()`
- Track pointer position: `this.editor.inputs.getCurrentPagePoint()`

The fluid simulation example ([`src/lib/fluid/FluidManager.ts`](src/lib/fluid/FluidManager.ts)) demonstrates shape integration in depth.

## Resources

- [WebGL2 Fundamentals](https://webgl2fundamentals.org/) - WebGL tutorials
- [The Book of Shaders](https://thebookofshaders.com/) - GLSL shader programming
- [Shadertoy](https://www.shadertoy.com/) - Shader examples
- svelte-draw Documentation - svelte-draw SDK docs

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
