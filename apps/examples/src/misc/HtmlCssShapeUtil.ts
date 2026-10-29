import { BaseBoxShapeUtil, shapeView, type TLShape } from 'svelte-draw'
import HtmlCssShapeComponent from './HtmlCssShapeComponent.svelte'

const HTML_TYPE = 'html' as const

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[HTML_TYPE]: { html: string; css: string; w: number; h: number }
	}
}

export type HtmlCssShape = TLShape<typeof HTML_TYPE>

export class HtmlCssShapeUtil extends BaseBoxShapeUtil<HtmlCssShape> {
	static override type = HTML_TYPE

	override getDefaultProps(): { html: string; css: string; w: number; h: number } {
		return { w: 100, h: 100, html: '', css: '' }
	}
	override component(shape: HtmlCssShape) {
		return shapeView(HtmlCssShapeComponent, { shape })
	}
	override getIndicatorPath(shape: HtmlCssShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
