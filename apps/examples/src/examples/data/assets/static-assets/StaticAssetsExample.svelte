<script lang="ts" module>
	import { SvelteDraw, type SvelteDrawProps } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	// [1]
	const assetUrls: SvelteDrawProps['assetUrls'] = {
		fonts: {
			svelteDraw_draw: '/ComicMono.woff',
		},
		icons: {
			'tool-arrow': '/custom-arrow-icon.svg',
		},
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="static-assets" {assetUrls} />
</div>

<!--
[1]
By default the `SvelteDraw` component loads its fonts, icons, and translations from svelte-draw's
asset CDN. `assetUrls` overrides individual URLs; anything you don't list keeps its
default. Both relative and absolute URLs work.

Here the "draw" font and the arrow tool icon are replaced with files served from this
SvelteKit project's static folder. Check your framework's docs for how it serves static files.

Define this object outside the component's instance script (or in a `module` script, as here).
A fresh object on every render would make `SvelteDraw` re-resolve its assets each time.
-->
