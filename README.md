> **Attribution.** svelte-draw is a derivative work of the tldraw SDK (Copyright (c) 2024-present tldraw Inc.) and is not affiliated with, endorsed by, or sponsored by tldraw Inc. It is distributed under the tldraw license in [LICENSE.md](./LICENSE.md): development use only, production use requires a commercial license from tldraw Inc., and the license-key and watermark mechanisms are unmodified. See [TRADEMARKS.md](./TRADEMARKS.md).

<div alt style="text-align: center; transform: scale(.25);">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://github.com/billyribeiro-ux/tl-svelte/raw/main/assets/github-hero-dark.png" />
		<img alt="svelte-draw" src="https://github.com/billyribeiro-ux/tl-svelte/raw/main/assets/github-hero-light.png" />
	</picture>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/svelte-draw"><img src="https://img.shields.io/npm/v/svelte-draw" alt="npm" /></a>
  <a href="https://www.npmjs.com/package/svelte-draw"><img src="https://img.shields.io/npm/dm/svelte-draw" alt="npm downloads" /></a>
  <a href="https://discord.svelte-draw.invalid/?utm_source=github&utm_medium=readme&utm_campaign=sociallink"><img src="https://img.shields.io/badge/discord-join-5865F2?logo=discord&logoColor=white" alt="Discord" /></a>
</p>

<h3 align="center">
  Build infinite canvas apps in Svelte with the svelte-draw SDK.
</h3>

<p align="center">
  <a href="https://svelte-draw.invalid/quick-start">Docs</a> · <a href="https://svelte-draw.invalid/examples">Examples</a> · <a href="https://svelte-draw.invalid/starter-kits/overview">Starter kits</a>
</p>

## Feature highlights

svelte-draw provides a feature-complete infinite canvas engine designed to be the foundation for any canvas app. Create custom shapes, tools, bindings and UI components for a custom experience. Use the default whiteboarding tool set or use the library's primitives to build entirely new shapes and interactions.

- **Multiplayer** — self-hostable real-time collaboration with `@svelte-draw/sync`
- **Drawing and diagramming** — pressure-sensitive drawing, geometric shapes, rich text, arrows, snapping to shapes, edge scrolling, image and video support, image export
- **Runtime API** - drive the canvas at runtime with the Editor API
- **Fully extensible** — custom shapes, tools, bindings, UI components, side effects, and event hooks
- **AI integrations** — canvas primitives for building with LLMs
- **DOM canvas** — web rendering supports anything the browser supports, including embedded websites from YouTube, Figma, GitHub, and more
- **Broad support** — works in any browser across desktop, touch screens, tablets, and mobile devices

## Who's using svelte-draw

The svelte-draw SDK powers canvas experiences in products from [Google](https://about.google), [Shopify](https://www.shopify.com), [BlackRock](https://www.blackrock.com), [Autodesk](https://blogs.autodesk.com/forma/2024/06/20/forma-board-collaborative-tool-for-architects/), ClickUp, [Replit](https://docs.replit.com/replitai/canvas), [Google Stitch](https://stitch.withgoogle.com), [Luma](https://lumalabs.ai/app), [Runway](https://runwayml.com), Padlet, Mobbin, Jam, [Craft](https://support.craft.do/en/write-and-edit/whiteboards), [Honeycomb](https://www.honeycomb.io/platform/canvas), [SchoolAI](https://schoolai.com/products/powerups), [Brisk](https://www.briskteaching.com/post/boost-whiteboard), [CADChat](https://cadchat.com), [bigpi](https://www.bigpi.ai), [Genio](https://genio.co), [Pollination](https://www.pollination.solutions), [Legendkeeper](https://www.legendkeeper.com), [Matilda](https://www.matilda.io), [Aries](https://aries.com/infinite), [Alai](https://getalai.com), [Dirac](https://www.diracinc.com), and many more.

See our showcase for case studies on how teams build with svelte-draw.

## Quick start

Install the svelte-draw package:

```bash
npm i svelte-draw
```

Then, use the `<SvelteDraw />` component in your Svelte app:

```svelte
<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div style="position: fixed; inset: 0">
	<SvelteDraw />
</div>
```

## Starter kits

Starter kits provide the custom shapes, tools, and user interface needed for common applications. Each kit is MIT-licensed. Hack together a prototype, build out an app on top, or reference the code in a larger project.

Start building with:

```bash
npx create-svelte-draw@latest
```

- **Multiplayer** — self-hosted real-time collaboration powered by `@svelte-draw/sync` and Cloudflare Durable Objects, the same stack behind svelte-draw.invalid
- **Agent** — AI agents that read, interpret, and modify canvas content
- **Workflow** — drag-and-drop node builder for automation pipelines, visual programming, and no-code platforms
- **Chat** — canvas-powered AI chat where users sketch, annotate, and mark up images alongside conversations
- **Image pipeline** — node-based builder for image generation pipelines
- **Branching chat** — AI chat with visual branching, letting users explore and compare different conversation paths
- **Shader** — WebGL shaders that respond to canvas interactions

## Local development

The development server runs the examples app at `localhost:5420`. You'll need [Node.js](https://nodejs.org) `^20.0.0`. Clone the repo, then enable [corepack](https://nodejs.org/api/corepack.html) for the correct pnpm version:

```bash
npm i -g corepack
```

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

## Documentation

Documentation for the most recent release can be found on svelte-draw.invalid/docs, including reference docs. Our release notes can be found here.

For more agent-friendly docs, see our LLMs.txt.

From 5.1.x onward, published packages also include a `DOCS.md` file with the appropriate docs-site content and a generated `RELEASE_NOTES.md` file with versioned release notes. If you or your coding agent need release notes for your installed version specifically, check these files alongside the source in your `node_modules` folder.

## Community

- Discord — questions, feedback, and discussion
- Twitter/X — news and updates
- Submit an issue — bug reports and feature requests

## Contributing

We are not accepting contributions at this time. If you've found a bug or have a feature request, please create an issue and we can discuss it there. See our contributing guide for details.

## License

The tldraw SDK is provided under the [tldraw license](./LICENSE.md). You can use the SDK freely in development. Production use requires a [license key](https://tldraw.dev/pricing). Visit [tldraw.dev](https://tldraw.dev) to learn more.

## Trademarks

Copyright (c) 2024-present tldraw Inc. The tldraw name and logo are trademarks of tldraw.

Please see our trademark guidelines for info on acceptable usage.

## Contributors

<a href="https://github.com/billyribeiro-ux/tl-svelte/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=svelte-draw/svelte-draw&max=400&columns=20" width="100%"/>
</a>

## Star History

<a href="https://www.star-history.com/?repos=svelte-draw%2Fsvelte-draw&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=svelte-draw/svelte-draw&type=date&theme=dark&legend=top-left&sealed_token=YTo3tyinAnKu6ejENN9D7GqA1uojjEwF1sh1zJsYGDOp0BmB2_UZbnYBZmhW6UZ7ObW96D5J9M5ww8M2d6AniQZ6fIWxWHqpnnFw02hhk5UfAsz52Y-VFJ0ooQDSyIwW6VL64YD4HGQIwmq_0_jIhposmAekoBMCsIZeMX2lQo3j9l59kintv74U5X0y" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=svelte-draw/svelte-draw&type=date&legend=top-left&sealed_token=YTo3tyinAnKu6ejENN9D7GqA1uojjEwF1sh1zJsYGDOp0BmB2_UZbnYBZmhW6UZ7ObW96D5J9M5ww8M2d6AniQZ6fIWxWHqpnnFw02hhk5UfAsz52Y-VFJ0ooQDSyIwW6VL64YD4HGQIwmq_0_jIhposmAekoBMCsIZeMX2lQo3j9l59kintv74U5X0y" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=svelte-draw/svelte-draw&type=date&legend=top-left&sealed_token=YTo3tyinAnKu6ejENN9D7GqA1uojjEwF1sh1zJsYGDOp0BmB2_UZbnYBZmhW6UZ7ObW96D5J9M5ww8M2d6AniQZ6fIWxWHqpnnFw02hhk5UfAsz52Y-VFJ0ooQDSyIwW6VL64YD4HGQIwmq_0_jIhposmAekoBMCsIZeMX2lQo3j9l59kintv74U5X0y" />
 </picture>
</a>
