import {
	DefaultFontStyle,
	shapeView,
	type SvgExportDef,
	type TLDefaultFillStyle,
	type TLShapeUtilCanvasSvgDef,
} from '@svelte-draw/editor'
import HashPatternForExport from './HashPatternForExport.svelte'
import PatternFillDefForCanvas from './PatternFillDefForCanvas.svelte'

export { createGetHashPatternZoomName } from './hashPatternUtils'

/** @public */
export function getFillDefForExport(fill: TLDefaultFillStyle): SvgExportDef {
	return {
		key: `${DefaultFontStyle.id}:${fill}`,
		async getElement() {
			if (fill !== 'pattern') return null

			return shapeView(HashPatternForExport, {})
		},
	}
}

export function getFillDefForCanvas(): TLShapeUtilCanvasSvgDef {
	return {
		key: `${DefaultFontStyle.id}:pattern`,
		view: shapeView(PatternFillDefForCanvas, {}),
	}
}
