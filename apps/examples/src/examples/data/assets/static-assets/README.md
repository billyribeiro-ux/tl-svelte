---
title: Static assets
component: ./StaticAssetsExample.svelte
keywords:
  [assets, asseturls, custom fonts, custom icons, cdn, static files, self host, configuration]
priority: 0
---

Replace individual fonts and icons, or self-host all of them, with the `assetUrls` prop.

---

The `SvelteDraw` component needs fonts, icons, and translations, which it fetches from svelte-draw's CDN by default. The `assetUrls` prop lets you point any of them at your own files, either to customize the look or to serve everything from your own origin. Entries you don't override keep their defaults.

This example swaps the "draw" font for Comic Mono and replaces the arrow tool's toolbar icon with a custom SVG. Select the draw font from the style panel and type some text, and look at the arrow tool in the toolbar, to see both in effect. To self-host every asset rather than a few, see the `@svelte-draw/assets` options in the installation docs.
