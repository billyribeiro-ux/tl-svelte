import { BaseBoxShapeUtil, shapeView, type TLShape } from 'svelte-draw'
import DangerousHtmlShapeView from './DangerousHtmlShape.svelte'

export const DANGEROUS_HTML_TYPE = 'dangerous-html'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[DANGEROUS_HTML_TYPE]: { w: number; h: number; html: string }
	}
}

// [1]
export type DangerousHtmlShape = TLShape<typeof DANGEROUS_HTML_TYPE>

// [2]
export class DangerousHtmlShapeUtil extends BaseBoxShapeUtil<DangerousHtmlShape> {
	static override type = DANGEROUS_HTML_TYPE

	override getDefaultProps() {
		return {
			w: 500,
			h: 300,
			html: '<div>hello</div>',
		}
	}

	override component(shape: DangerousHtmlShape) {
		return shapeView(DangerousHtmlShapeView, { html: shape.props.html })
	}

	override getIndicatorPath(shape: DangerousHtmlShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
