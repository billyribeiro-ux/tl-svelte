import { DefaultColorStyle, type RecordProps, T } from 'svelte-draw'
import type { ICardShape } from './CardShapeUtil'

// Validation for our custom card shape's props, using one of svelte-draw's default styles
export const cardShapeProps: RecordProps<ICardShape> = {
	w: T.number,
	h: T.number,
	color: DefaultColorStyle,
}

// To generate your own custom styles, check out the custom styles example.
