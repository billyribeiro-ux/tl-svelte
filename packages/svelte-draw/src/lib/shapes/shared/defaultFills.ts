import { type TLDefaultColor, type TLDefaultFillStyle } from '@svelte-draw/tlschema'

export const DEFAULT_FILL_COLOR_NAMES: Record<
	Exclude<TLDefaultFillStyle, 'none' | 'semi'>,
	keyof TLDefaultColor
> = {
	solid: 'semi',
	pattern: 'pattern',
	fill: 'fill',
	'lined-fill': 'linedFill',
}
