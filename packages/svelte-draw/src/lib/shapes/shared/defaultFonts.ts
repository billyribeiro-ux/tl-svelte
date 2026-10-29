import { EMPTY_ARRAY, objectMapValues, type TLFontFace, type TLTheme } from '@svelte-draw/editor'

/** @public */
export interface TLDefaultFont {
	normal: {
		normal: TLFontFace
		bold: TLFontFace
	}
	italic: {
		normal: TLFontFace
		bold: TLFontFace
	}
}
/** @public */
export interface TLDefaultFonts {
	svelteDraw_draw: TLDefaultFont
	svelteDraw_sans: TLDefaultFont
	svelteDraw_serif: TLDefaultFont
	svelteDraw_mono: TLDefaultFont
}

/** @public */
export const DefaultFontFaces: TLDefaultFonts = {
	svelteDraw_draw: {
		normal: {
			normal: {
				family: 'svelteDraw_draw',
				src: { url: 'svelteDraw_draw', format: 'woff2' },
				weight: 'normal',
			},
			bold: {
				family: 'svelteDraw_draw',
				src: { url: 'svelteDraw_draw_bold', format: 'woff2' },
				weight: 'bold',
			},
		},
		italic: {
			normal: {
				family: 'svelteDraw_draw',
				src: { url: 'svelteDraw_draw_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'svelteDraw_draw',
				src: { url: 'svelteDraw_draw_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
	svelteDraw_sans: {
		normal: {
			normal: {
				family: 'svelteDraw_sans',
				src: { url: 'svelteDraw_sans', format: 'woff2' },
				weight: 'normal',
				style: 'normal',
			},
			bold: {
				family: 'svelteDraw_sans',
				src: { url: 'svelteDraw_sans_bold', format: 'woff2' },
				weight: 'bold',
				style: 'normal',
			},
		},
		italic: {
			normal: {
				family: 'svelteDraw_sans',
				src: { url: 'svelteDraw_sans_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'svelteDraw_sans',
				src: { url: 'svelteDraw_sans_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
	svelteDraw_serif: {
		normal: {
			normal: {
				family: 'svelteDraw_serif',
				src: { url: 'svelteDraw_serif', format: 'woff2' },
				weight: 'normal',
				style: 'normal',
			},
			bold: {
				family: 'svelteDraw_serif',
				src: { url: 'svelteDraw_serif_bold', format: 'woff2' },
				weight: 'bold',
				style: 'normal',
			},
		},
		italic: {
			normal: {
				family: 'svelteDraw_serif',
				src: { url: 'svelteDraw_serif_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'svelteDraw_serif',
				src: { url: 'svelteDraw_serif_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
	svelteDraw_mono: {
		normal: {
			normal: {
				family: 'svelteDraw_mono',
				src: { url: 'svelteDraw_mono', format: 'woff2' },
				weight: 'normal',
				style: 'normal',
			},
			bold: {
				family: 'svelteDraw_mono',
				src: { url: 'svelteDraw_mono_bold', format: 'woff2' },
				weight: 'bold',
				style: 'normal',
			},
		},
		italic: {
			normal: {
				family: 'svelteDraw_mono',
				src: { url: 'svelteDraw_mono_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'svelteDraw_mono',
				src: { url: 'svelteDraw_mono_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
}

/** @public */
export const allDefaultFontFaces = objectMapValues(DefaultFontFaces).flatMap((font) =>
	objectMapValues(font).flatMap((fontFace) => Object.values(fontFace))
)

/**
 * Get the font faces for a given font style from the theme. For built-in fonts, returns
 * undefined so callers can fall back to the rich-text-aware font scanning. For custom
 * fonts (defined in the theme but not in DefaultFontFaces), returns the faces directly.
 *
 * @internal
 */
export function getThemeFontFaces(theme: TLTheme, font: string): TLFontFace[] | undefined {
	const builtinFamily = `svelteDraw_${font}` as keyof TLDefaultFonts
	if (builtinFamily in DefaultFontFaces) return undefined

	const themeFont = theme.fonts[font as keyof typeof theme.fonts]
	if (process.env.NODE_ENV !== 'production') {
		if (!themeFont) {
			console.warn(
				`Font '${font}' is not defined in the current theme. Shapes using this font may not render correctly.`
			)
		}
	}
	return themeFont?.faces ?? EMPTY_ARRAY
}
