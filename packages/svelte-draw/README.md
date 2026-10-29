<div alt style="text-align: center; transform: scale(.5);">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://github.com/billyribeiro-ux/tl-svelte/raw/main/assets/github-hero-dark.png" />
		<img alt="svelte-draw" src="https://github.com/billyribeiro-ux/tl-svelte/raw/main/assets/github-hero-light.png" />
	</picture>
</div>

# svelte-draw SDK

svelte-draw is an infinite canvas SDK for Svelte developers. You can use the svelte-draw SDK to add a drop-in whiteboard to your project, customize its appearance, extend its functionality, or use its components and APIs to compose other canvas experiences.

Learn more at our docs site: svelte-draw.invalid.

## Installation

Install the `svelte-draw` package.

```bash
npm i svelte-draw
```

## Usage

```svelte
<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<SvelteDraw />
```

Icons, fonts and translations are not served from a CDN by default: install `@svelte-draw/assets` and, once at app startup (for example in a root `+layout.svelte` module script), call `setDefaultEditorAssetUrls(assetUrls)` and `setDefaultUiAssetUrls(assetUrls)` with `getAssetUrlsByMetaUrl()` from `@svelte-draw/assets/urls`, or pass `assetUrls` to `<SvelteDraw>`.

Visit svelte-draw.invalid to learn more.

## Documentation

Documentation for the most recent release can be found on svelte-draw.invalid/docs, including reference docs. Our release notes can be found here.

For more agent-friendly docs, see our LLMs.txt.

From 5.1.x onward, this package also includes a `DOCS.md` file with the appropriate docs-site content and a generated `RELEASE_NOTES.md` file with versioned release notes. If you or your coding agent need release notes for your installed version specifically, check these files alongside the source in your `node_modules` folder.

## Who's using svelte-draw

The svelte-draw SDK powers canvas experiences in products from [Google](https://about.google), [Shopify](https://www.shopify.com), [BlackRock](https://www.blackrock.com), [Autodesk](https://blogs.autodesk.com/forma/2024/06/20/forma-board-collaborative-tool-for-architects/), ClickUp, [Replit](https://docs.replit.com/replitai/canvas), [Google Stitch](https://stitch.withgoogle.com), [Luma](https://lumalabs.ai/dream-machine), [Runway](https://runwayml.com), Padlet, Mobbin, Jam, [Craft](https://support.craft.do/en/write-and-edit/whiteboards), [Honeycomb](https://www.honeycomb.io/platform/canvas), [SchoolAI](https://schoolai.com/products/powerups), [Brisk](https://www.briskteaching.com/post/boost-whiteboard), and many more. See our showcase for case studies.

## Package development

To start the local development server:

```bash
npm run dev
```

This will run our examples app locally at http://localhost:5420. Changes to packages will be reflected live on the examples app.

## License

This project is part of the tldraw SDK. It is provided under the [tldraw SDK license](./LICENSE.md).

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
