import {
	DEFAULT_THEME,
	DefaultColorStyle,
	DefaultFontStyle,
	shapeView,
	TLDOCUMENT_ID,
	type Editor,
	type JsonObject,
	type TLDefaultColor,
	type TLShape,
	type TLShapePartial,
	type TLTheme,
	type TLThemeFont,
	type TLUiOverrides,
} from 'svelte-draw'
import FontIcon from './FontIcon.svelte'

// Pre-declare slot names for custom colors and fonts. The runtime only
// fills the slots the user has actually added, but TypeScript needs concrete
// keys to compute `TLDefaultColorStyle` / `TLDefaultFontStyle`.
export const MAX_CUSTOM_COLORS = 20
export const MAX_CUSTOM_FONTS = 10

export const PERSISTENCE_KEY = 'color-picker-example'

export type CustomColorKey =
	| 'custom-1'
	| 'custom-2'
	| 'custom-3'
	| 'custom-4'
	| 'custom-5'
	| 'custom-6'
	| 'custom-7'
	| 'custom-8'
	| 'custom-9'
	| 'custom-10'
	| 'custom-11'
	| 'custom-12'
	| 'custom-13'
	| 'custom-14'
	| 'custom-15'
	| 'custom-16'
	| 'custom-17'
	| 'custom-18'
	| 'custom-19'
	| 'custom-20'

export type CustomFontKey =
	| 'gf-1'
	| 'gf-2'
	| 'gf-3'
	| 'gf-4'
	| 'gf-5'
	| 'gf-6'
	| 'gf-7'
	| 'gf-8'
	| 'gf-9'
	| 'gf-10'

declare module '@svelte-draw/tlschema' {
	interface TLThemeDefaultColors {
		'custom-1': TLDefaultColor
		'custom-2': TLDefaultColor
		'custom-3': TLDefaultColor
		'custom-4': TLDefaultColor
		'custom-5': TLDefaultColor
		'custom-6': TLDefaultColor
		'custom-7': TLDefaultColor
		'custom-8': TLDefaultColor
		'custom-9': TLDefaultColor
		'custom-10': TLDefaultColor
		'custom-11': TLDefaultColor
		'custom-12': TLDefaultColor
		'custom-13': TLDefaultColor
		'custom-14': TLDefaultColor
		'custom-15': TLDefaultColor
		'custom-16': TLDefaultColor
		'custom-17': TLDefaultColor
		'custom-18': TLDefaultColor
		'custom-19': TLDefaultColor
		'custom-20': TLDefaultColor
	}
	interface TLThemeFonts {
		'gf-1': TLThemeFont
		'gf-2': TLThemeFont
		'gf-3': TLThemeFont
		'gf-4': TLThemeFont
		'gf-5': TLThemeFont
		'gf-6': TLThemeFont
		'gf-7': TLThemeFont
		'gf-8': TLThemeFont
		'gf-9': TLThemeFont
		'gf-10': TLThemeFont
	}
}

export interface GoogleFont {
	name: string
	family: string
}
export const GOOGLE_FONTS: GoogleFont[] = [
	{ name: 'Roboto', family: "'Roboto', sans-serif" },
	{ name: 'Lato', family: "'Lato', sans-serif" },
	{ name: 'Open Sans', family: "'Open Sans', sans-serif" },
	{ name: 'Montserrat', family: "'Montserrat', sans-serif" },
	{ name: 'Raleway', family: "'Raleway', sans-serif" },
	{ name: 'Oswald', family: "'Oswald', sans-serif" },
	{ name: 'Playfair Display', family: "'Playfair Display', serif" },
	{ name: 'Merriweather', family: "'Merriweather', serif" },
	{ name: 'Pacifico', family: "'Pacifico', cursive" },
	{ name: 'Caveat', family: "'Caveat', cursive" },
	{ name: 'Permanent Marker', family: "'Permanent Marker', cursive" },
	{ name: 'Bebas Neue', family: "'Bebas Neue', sans-serif" },
]

// Fan a single hex onto every role in TLDefaultColor. The theme renderer
// reads different roles for different contexts (outline vs fill vs note
// background); we use the picked hex for all of them plus a translucent
// variant for the semi fills.
function makeColor(solid: string): TLDefaultColor {
	const translucent = solid + '33'
	return {
		solid,
		semi: translucent,
		pattern: solid,
		fill: solid,
		linedFill: translucent,
		frameHeadingStroke: solid,
		frameHeadingFill: translucent,
		frameStroke: solid,
		frameFill: translucent,
		frameText: solid,
		noteFill: translucent,
		noteText: solid,
		highlightSrgb: solid,
		highlightP3: solid,
	}
}

// The style panel's font icon is a ShapeView (component + props) rendering "Aa" in the font.
function makeFontEntry(family: string): TLThemeFont {
	return { fontFamily: family, icon: shapeView(FontIcon, { family }) }
}

const customColorTranslations: Record<string, string> = {}
for (let i = 1; i <= MAX_CUSTOM_COLORS; i++) {
	customColorTranslations[`color-style.custom-${i}`] = `Custom ${i}`
}
const customFontTranslations: Record<string, string> = {}
for (let i = 1; i <= MAX_CUSTOM_FONTS; i++) {
	customFontTranslations[`font-style.gf-${i}`] = `Google font ${i}`
}
export const uiOverrides: TLUiOverrides = {
	translations: {
		en: { ...customColorTranslations, ...customFontTranslations },
	},
}

// Inject one <link> loading every curated Google Font family, so dropdown
// previews render in the right typeface and canvas text picks up the family
// once it's registered in the theme.
let googleFontsLoaded = false
export function ensureGoogleFontsLoaded() {
	if (googleFontsLoaded) return
	googleFontsLoaded = true
	const families = GOOGLE_FONTS.map((f) => `family=${f.name.replace(/ /g, '+')}`).join('&')
	const link = document.createElement('link')
	link.rel = 'stylesheet'
	link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`
	document.head.appendChild(link)
}

// The palette (which hex/family each `custom-*` / `gf-*` slot maps to) lives
// on the svelte-draw document's `meta`. Shapes only persist the slot *key* (`custom-2`,
// `gf-1`); this is where the slot's actual value is kept. Storing it in the
// document — instead of a separate React/localStorage copy — means the editor
// persists it (via `persistenceKey`), syncs it across tabs, and includes it in
// undo/redo for free, always atomically with the shapes that reference it. There
// is therefore nothing to hand-reconcile: no cross-tab listener, no load-time
// recovery, no save-failure handling.
const PALETTE_META_KEY = 'colorPickerPalette'

export interface Palette {
	hexes: string[]
	fonts: GoogleFont[]
}

function isGoogleFont(v: unknown): v is GoogleFont {
	return (
		typeof v === 'object' &&
		v !== null &&
		typeof (v as GoogleFont).family === 'string' &&
		typeof (v as GoogleFont).name === 'string'
	)
}

// `meta` is free-form JSON, so normalise whatever we read into a known shape.
// This also guards against a corrupt or hand-edited document.
export function parsePalette(raw: unknown): Palette {
	const obj = (raw ?? {}) as { hexes?: unknown; fonts?: unknown }
	return {
		hexes: Array.isArray(obj.hexes)
			? obj.hexes.filter((h): h is string => typeof h === 'string').slice(0, MAX_CUSTOM_COLORS)
			: [],
		fonts: Array.isArray(obj.fonts)
			? obj.fonts.filter(isGoogleFont).slice(0, MAX_CUSTOM_FONTS)
			: [],
	}
}

export function readRawPalette(editor: Editor): unknown {
	return editor.getDocumentSettings().meta[PALETTE_META_KEY]
}

// Write the palette into the document `meta`. Call this inside `editor.run` so it
// batches into one undo step with any shape repair that goes with it.
export function writePalette(editor: Editor, palette: Palette) {
	editor.store.update(TLDOCUMENT_ID, (doc) => ({
		...doc,
		meta: { ...doc.meta, [PALETTE_META_KEY]: palette as unknown as JsonObject },
	}))
}

const isCustomColor = (v: unknown): v is string => typeof v === 'string' && /^custom-\d+$/.test(v)
const isCustomFont = (v: unknown): v is string => typeof v === 'string' && /^gf-\d+$/.test(v)

const DEFAULT_COLOR = DefaultColorStyle.defaultValue
const DEFAULT_FONT = DefaultFontStyle.defaultValue

// When the palette is cleared, the slots leave the *live* theme, so every
// shape and the per-tab "next shape" style that still names a `custom-*` / `gf-*`
// slot is remapped back to a built-in value (`black` / `draw`). The enum keeps
// every slot registered (see `buildCompleteTheme`), so this isn't needed to keep
// records valid — it just stops those shapes from rendering with an empty slot.
// Run inside the same `editor.run` as the palette write so the two move together
// through undo/redo.
export function repairShapesUsingCustomStyles(editor: Editor) {
	const updates: TLShapePartial[] = []
	for (const record of editor.store.allRecords()) {
		if (record.typeName !== 'shape') continue
		const shape = record as TLShape
		const props = shape.props as Record<string, unknown>
		const next: Record<string, unknown> = {}
		if (isCustomColor(props.color)) next.color = DEFAULT_COLOR
		if (isCustomColor(props.labelColor)) next.labelColor = DEFAULT_COLOR
		if (isCustomFont(props.font)) next.font = DEFAULT_FONT
		if (Object.keys(next).length > 0) {
			updates.push({ id: shape.id, type: shape.type, props: next } as TLShapePartial)
		}
	}
	if (updates.length > 0) editor.updateShapes(updates)

	// `stylesForNextShape` lives on the per-tab `instance` record; reset any entry
	// that points at a slot we're removing so the next created shape doesn't
	// re-apply it.
	const stylesForNextShape = editor.getInstanceState().stylesForNextShape
	const fixed: Record<string, unknown> = {}
	for (const [id, value] of Object.entries(stylesForNextShape)) {
		if (isCustomColor(value)) fixed[id] = DEFAULT_COLOR
		else if (isCustomFont(value)) fixed[id] = DEFAULT_FONT
	}
	if (Object.keys(fixed).length > 0) {
		editor.updateInstanceState({ stylesForNextShape: { ...stylesForNextShape, ...fixed } })
	}
}

export function buildTheme(hexes: string[], fonts: GoogleFont[]): TLTheme {
	const lightColors = { ...DEFAULT_THEME.colors.light } as TLTheme['colors']['light']
	const darkColors = { ...DEFAULT_THEME.colors.dark } as TLTheme['colors']['dark']
	for (let i = 0; i < hexes.length; i++) {
		const key = `custom-${i + 1}` as CustomColorKey
		const entry = makeColor(hexes[i])
		lightColors[key] = entry
		darkColors[key] = entry
	}

	const themeFonts = { ...DEFAULT_THEME.fonts } as TLTheme['fonts']
	for (let i = 0; i < fonts.length; i++) {
		const key = `gf-${i + 1}` as CustomFontKey
		themeFonts[key] = makeFontEntry(fonts[i].family)
	}

	return {
		...DEFAULT_THEME,
		id: 'default',
		colors: { light: lightColors, dark: darkColors },
		fonts: themeFonts,
	}
}

// A stable theme that registers *every* possible custom slot (`custom-1..N`,
// `gf-1..N`). It's passed as the `themes` prop, which `createTLStore` registers
// into the style enum *before* the persisted document is validated on load, and
// which the editor re-registers on every render. Registering the full set means:
//   - persisted or cross-tab shapes can never reference a slot the enum doesn't
//     know, so they always pass validation (no load crash, no per-render drop);
//   - the enum is never narrowed, so adding/removing palette entries can't
//     invalidate existing shapes.
// The placeholder values here are never shown: the style panel and canvas read
// the *live* theme, which we set with `editor.updateTheme(buildTheme(...))` to
// contain only the slots actually in the palette.
export function buildCompleteTheme(): TLTheme {
	const hexes = Array.from({ length: MAX_CUSTOM_COLORS }, () => '#000000')
	const fonts: GoogleFont[] = Array.from({ length: MAX_CUSTOM_FONTS }, (_, i) => ({
		name: `placeholder-${i + 1}`,
		family: 'sans-serif',
	}))
	return buildTheme(hexes, fonts)
}

export function randomHex(): string {
	const hue = Math.floor(Math.random() * 360)
	return hslToHex(hue, 70, 55)
}

function hslToHex(h: number, s: number, l: number): string {
	const sNorm = s / 100
	const lNorm = l / 100
	const k = (n: number) => (n + h / 30) % 12
	const a = sNorm * Math.min(lNorm, 1 - lNorm)
	const f = (n: number) =>
		Math.round(255 * (lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))))
	const toHex = (v: number) => v.toString(16).padStart(2, '0')
	return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}
