import { BaseBoxShapeUtil, T, shapeView, type RecordProps, type TLShape } from 'svelte-draw'
import CardShapeComponent from './CardShapeComponent.svelte'

export const CARD_SHAPE_TYPE = 'note-card'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[CARD_SHAPE_TYPE]: { w: number; h: number; title: string; description: string }
	}
}

type CardShape = TLShape<typeof CARD_SHAPE_TYPE>

export class CardShapeUtil extends BaseBoxShapeUtil<CardShape> {
	static override type = CARD_SHAPE_TYPE
	static override props: RecordProps<CardShape> = {
		w: T.number,
		h: T.number,
		title: T.string,
		description: T.string,
	}

	getDefaultProps(): CardShape['props'] {
		return {
			w: 300,
			h: 180,
			title: 'Untitled',
			description: '',
		}
	}

	// [1]
	override getAriaDescriptor(shape: CardShape): string | undefined {
		const { title, description } = shape.props
		if (description) {
			return `${title} - ${description}`
		}
		return title
	}

	// [2]
	override getText(shape: CardShape): string | undefined {
		return `${shape.props.title}\n${shape.props.description}`
	}

	component(shape: CardShape) {
		const { title, description } = shape.props
		return shapeView(CardShapeComponent, { title, description })
	}

	getIndicatorPath(shape: CardShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
