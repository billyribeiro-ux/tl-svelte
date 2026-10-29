<script lang="ts" module>
	import {
		DEFAULT_THEME,
		type Editor,
		type TLDefaultColor,
		type TLTheme,
		type TLThemeFont,
		type TLThemes,
		type TLUiOverrides,
		shapeView,
		toRichText,
	} from 'svelte-draw'
	import silkscreenBoldUrl from './custom-font/Silkscreen-Bold.ttf'
	import silkscreenRegularUrl from './custom-font/Silkscreen-Regular.ttf'
	import FontIcon from './FontIcon.svelte'

	// [1]
	declare module '@svelte-draw/tlschema' {
		interface TLThemeDefaultColors {
			pink: TLDefaultColor
		}
		interface TLThemeFonts {
			pixel: TLThemeFont
			cursive: TLThemeFont
		}
		// [2]
		interface TLRemovedDefaultThemeColors {
			'light-violet': true
			'light-blue': true
			'light-green': true
			'light-red': true
		}
	}

	// Helper to create a full color entry from a base solid color
	function makeColor(solid: string, semi: string, pattern: string): TLDefaultColor {
		return {
			solid,
			semi,
			pattern,
			fill: solid,
			linedFill: semi,
			frameHeadingStroke: solid,
			frameHeadingFill: semi,
			frameStroke: solid,
			frameFill: semi,
			frameText: solid,
			noteFill: semi,
			noteText: solid,
			highlightSrgb: solid,
			highlightP3: solid,
		}
	}

	// [3]
	const pinkLight = makeColor('#e91e8c', '#fce4f2', '#f06baf')
	const pinkDark = makeColor('#f06baf', '#3d1a2e', '#e91e8c')

	// [4]
	const pixelFont: TLThemeFont = {
		fontFamily: "'Silkscreen', sans-serif",
		icon: shapeView(FontIcon, { family: 'Silkscreen, sans-serif' }),
		faces: [
			{
				family: 'Silkscreen',
				src: { url: silkscreenRegularUrl },
				weight: 'normal',
				style: 'normal',
			},
			{
				family: 'Silkscreen',
				src: { url: silkscreenBoldUrl },
				weight: 'bold',
				style: 'normal',
			},
		],
	}

	// Custom font — use a Google Font loaded via full URLs. These versioned
	// gstatic URLs expire when Google revs the font; refresh them from
	// https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700 if they 404.
	const cursiveFont: TLThemeFont = {
		fontFamily: "'Comic Neue', cursive",
		icon: shapeView(FontIcon, { family: "'Comic Neue', cursive" }),
		faces: [
			{
				family: 'Comic Neue',
				src: {
					url: 'https://fonts.gstatic.com/s/comicneue/v9/4UaHrEJDsxBrF37olUeD96rp57F2IwM.woff2',
					format: 'woff2',
				},
				weight: 'normal',
				style: 'normal',
			},
			{
				family: 'Comic Neue',
				src: {
					url: 'https://fonts.gstatic.com/s/comicneue/v9/4UaErEJDsxBrF37olUeD_xHM8pxULilENlY.woff2',
					format: 'woff2',
				},
				weight: 'bold',
				style: 'normal',
			},
		],
	}

	// [5]
	const { serif: _serif, ...keptFonts } = DEFAULT_THEME.fonts
	const customFonts = { ...keptFonts, pixel: pixelFont, cursive: cursiveFont } as TLTheme['fonts']

	// [6]
	function colorsWithoutLightVariants(base: Record<string, unknown>, pink: TLDefaultColor) {
		const {
			'light-violet': _lv,
			'light-blue': _lb,
			'light-green': _lg,
			'light-red': _lr,
			...kept
		} = base
		return { ...kept, pink } as TLTheme['colors']['light']
	}

	// [7]
	const uiOverrides: TLUiOverrides = {
		translations: {
			en: {
				'color-style.pink': 'Pink',
				'font-style.pixel': 'Pixel',
				'font-style.cursive': 'Cursive',
			},
		},
	}

	// [8]
	const DEFAULTS = {
		fontSize: 16,
		lineHeight: 1.35,
		strokeWidth: 2,
	}

	// [9]
	const themes: Partial<TLThemes> = {
		default: {
			id: 'default',
			fontSize: DEFAULTS.fontSize,
			lineHeight: DEFAULTS.lineHeight,
			strokeWidth: DEFAULTS.strokeWidth,
			fonts: customFonts,
			colors: {
				light: colorsWithoutLightVariants(DEFAULT_THEME.colors.light, pinkLight),
				dark: colorsWithoutLightVariants(DEFAULT_THEME.colors.dark, pinkDark),
			},
		},
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './custom-theme.css'
	import ThemeControls from './ThemeControls.svelte'

	let fontSize = $state(DEFAULTS.fontSize)
	let lineHeight = $state(DEFAULTS.lineHeight)
	let strokeWidth = $state(DEFAULTS.strokeWidth)
	let editor = $state.raw<Editor | null>(null)

	// Apply slider values to the theme programmatically. Rather than passing
	// a new `themes` object whenever a value changes (which would recreate the
	// store and reload the canvas from persistence), we update the existing
	// "default" theme in place via `editor.updateTheme()`. Spreading the current
	// theme preserves the custom colors and fonts while overriding the adjusted
	// values. Shapes re-render reactively without the board flashing.
	$effect(() => {
		const e = editor
		if (!e) return
		e.updateTheme({ ...e.getTheme('default')!, fontSize, lineHeight, strokeWidth })
	})

	function handleMount(e: Editor) {
		editor = e
		if (e.getCurrentPageShapeIds().size > 0) return

		e.createShape({
			type: 'geo',
			x: 100,
			y: 100,
			props: { w: 200, h: 200, color: 'red' },
		})
		e.createShape({
			type: 'geo',
			x: 350,
			y: 100,
			props: {
				w: 200,
				h: 200,
				color: 'blue',
				geo: 'ellipse',
				richText: toRichText('Hello'),
			},
		})
		// [10]
		e.createShape({
			type: 'geo',
			x: 600,
			y: 100,
			props: { w: 200, h: 200, color: 'pink', geo: 'diamond' },
		})
		e.createShape({
			type: 'text',
			x: 100,
			y: 350,
			props: { richText: toRichText('Theme text'), size: 'l' },
		})
		// [11]
		e.createShape({
			type: 'text',
			x: 350,
			y: 350,
			props: { richText: toRichText('Pixel font!'), size: 'l', font: 'pixel' },
		})
		e.createShape({
			type: 'text',
			x: 600,
			y: 350,
			props: { richText: toRichText('Cursive font!'), size: 'l', font: 'cursive' },
		})
		e.createShape({
			type: 'note',
			x: 100,
			y: 500,
			props: {
				color: 'black',
				richText: toRichText('A sticky note'),
			},
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="custom-theme-example"
		{themes}
		overrides={uiOverrides}
		onMount={handleMount}
	>
		<ThemeControls bind:fontSize bind:lineHeight bind:strokeWidth defaults={DEFAULTS} />
	</SvelteDraw>
</div>

<!--

[1]
Extend the `TLThemeDefaultColors` and `TLThemeFonts` interfaces via module
augmentation so TypeScript knows about the custom "pink" color and the "pixel"
and "cursive" fonts. Because `themes` is passed to `<SvelteDraw>`, the names are
registered with the style enums automatically at store creation.

[2]
Extend `TLRemovedDefaultThemeColors` to remove built-in colors from the type.
This is the type-level half of removing the "light-*" variants; [6] removes
them from the theme values.

[3]
Define color entries for light and dark variants. Each theme needs a full
`TLDefaultColor` entry for the custom color in both palettes.

[4]
A custom font has a `fontFamily` CSS string and, for fonts that need loading, a
`faces` array of `TLFontFace` entries pointing at the font files (here bundled
locally via import; the cursive font below uses remote URLs). System fonts like
Arial or Georgia can omit `faces`. The `icon` field is a `shapeView` (see FontIcon.svelte) the
style panel uses as the button for this font; here "Aa" rendered in the font
itself.

[5]
Remove a built-in font: destructure "serif" out of the default font palette and
spread the rest. The serif option disappears from the style panel and the two
custom fonts take its place.

[6]
Remove built-in colors: destructure the "light-*" variants out of the default
palette. They won't appear in the style panel, and "pink" is added in their place.

[7]
Translation overrides provide human-readable names for custom style values.
Without these, the tooltip for "pink" would show the raw key "color-style.pink".

[8]
Default values for the adjustable theme properties. These match `DEFAULT_THEME`.

[9]
The `themes` prop is a stable object passed once to `<SvelteDraw>`. It registers the
custom color and fonts at store creation and seeds the starting values. Slider
adjustments are applied at runtime with `editor.updateTheme()` rather than by
passing a new `themes` prop, because a new object would recreate the store and
reload the canvas from persistence. `updateTheme` updates the active theme
reactively, so shapes re-render immediately. Which palette (light or dark) is
used follows the user's color scheme preference.

[10]
Create a shape using the custom "pink" color. Because the theme declares the
color, it passes validation.

[11]
Create shapes using the custom "pixel" and "cursive" fonts. They show up in the
style panel alongside the remaining built-in fonts (draw, sans, mono).

[12]
A panel with sliders for `fontSize`, `lineHeight`, and `strokeWidth`. Try
drawing some shapes with different sizes and then moving the stroke width
slider to see how theme values affect shape rendering.

-->
