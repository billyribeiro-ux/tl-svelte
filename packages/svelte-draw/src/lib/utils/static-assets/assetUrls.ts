import { type RecursivePartial, getDefaultCdnBaseUrl } from '@svelte-draw/editor'

/** @public */
export interface TLEditorAssetUrls {
	fonts?: {
		svelteDraw_mono?: string
		svelteDraw_mono_italic?: string
		svelteDraw_mono_bold?: string
		svelteDraw_mono_italic_bold?: string
		svelteDraw_serif?: string
		svelteDraw_serif_italic?: string
		svelteDraw_serif_bold?: string
		svelteDraw_serif_italic_bold?: string
		svelteDraw_sans?: string
		svelteDraw_sans_italic?: string
		svelteDraw_sans_bold?: string
		svelteDraw_sans_italic_bold?: string
		svelteDraw_draw?: string
		svelteDraw_draw_italic?: string
		svelteDraw_draw_bold?: string
		svelteDraw_draw_italic_bold?: string
		[key: string]: string | undefined
	}
}

/** @public */
export let defaultEditorAssetUrls: TLEditorAssetUrls = {
	fonts: {
		svelteDraw_mono: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-Medium.woff2`,
		svelteDraw_mono_italic: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-MediumItalic.woff2`,
		svelteDraw_mono_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-Bold.woff2`,
		svelteDraw_mono_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-BoldItalic.woff2`,
		svelteDraw_serif: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-Medium.woff2`,
		svelteDraw_serif_italic: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-MediumItalic.woff2`,
		svelteDraw_serif_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-Bold.woff2`,
		svelteDraw_serif_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-BoldItalic.woff2`,
		svelteDraw_sans: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-Medium.woff2`,
		svelteDraw_sans_italic: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-MediumItalic.woff2`,
		svelteDraw_sans_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-Bold.woff2`,
		svelteDraw_sans_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-BoldItalic.woff2`,
		svelteDraw_draw: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Regular.woff2`,
		svelteDraw_draw_italic: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Regular_Italic.woff2`,
		svelteDraw_draw_bold: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Bold.woff2`,
		svelteDraw_draw_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Bold_Italic.woff2`,
	},
}

/** @internal */
export function setDefaultEditorAssetUrls(assetUrls: TLEditorAssetUrls) {
	defaultEditorAssetUrls = assetUrls
}

/** @internal */
export function getEditorAssetUrlsWithOverrides(
	overrides?: RecursivePartial<TLEditorAssetUrls>
): TLEditorAssetUrls {
	if (!overrides) return defaultEditorAssetUrls

	return {
		fonts: { ...defaultEditorAssetUrls.fonts, ...overrides?.fonts },
	}
}
