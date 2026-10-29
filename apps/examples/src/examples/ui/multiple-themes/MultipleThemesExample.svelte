<script lang="ts">
	import { SvelteDraw, toRichText, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './multiple-themes.css'
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	import { themes } from './themes'

	// There's a guide at the bottom of this file!

	function createInitialShapes(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return
		editor.createShapes([
			{
				type: 'geo',
				x: 100,
				y: 100,
				props: { w: 200, h: 200, color: 'blue', richText: toRichText('Try switching themes') },
			},
			{
				type: 'note',
				x: 350,
				y: 100,
				props: { color: 'violet', richText: toRichText('Colors change per theme') },
			},
		])
	}
</script>

<div class="svelte-draw__editor">
	<!-- [4] -->
	<SvelteDraw persistenceKey="multiple-themes-example" {themes} onMount={createInitialShapes}>
		<ThemeSwitcher />
	</SvelteDraw>
</div>

<!--
[1]
themes.ts extends the `TLThemes` interface to register custom theme IDs.
This gives you type-safe theme names throughout the API: `editor.setCurrentTheme('ocean')`
will autocomplete, and passing an unregistered name will be a type error.

[2]
Define theme objects by cloning `DEFAULT_THEME` and overriding just the colors
you want to change. Each theme contains both `light` and `dark` color palettes.

[3]
Collect the themes in a `Partial<TLThemes>`. The `default` theme is always registered,
so only the additional themes need to be listed. Keep this object at module level: it's
a prop of `<SvelteDraw>`, and a new object each render would re-register the themes.

[4]
`<SvelteDraw>` registers the `themes` at mount time and keeps them updated if the prop
changes. You can also register or update themes later with `editor.updateTheme()`.

[5]
`editor.setCurrentTheme(id)` switches theme at runtime and `editor.getCurrentThemeId()`
is reactive, so reading it in `fromComputed` (ThemeSwitcher.svelte) keeps the active button highlighted.
-->
