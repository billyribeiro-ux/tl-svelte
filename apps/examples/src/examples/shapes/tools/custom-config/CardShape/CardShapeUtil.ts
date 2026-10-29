import {
	Rectangle2d,
	ShapeUtil,
	type TLDefaultColorStyle,
	type TLResizeInfo,
	type TLShape,
	getColorValue,
	resizeBox,
	shapeView,
} from 'svelte-draw'
import { cardShapeMigrations } from './card-shape-migrations'
import { cardShapeProps } from './card-shape-props'
import CardShapeComponent from './CardShape.svelte'

export const CARD_TYPE = 'card'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[CARD_TYPE]: { w: number; h: number; color: TLDefaultColorStyle }
	}
}

// A type for our custom card shape
export type ICardShape = TLShape<typeof CARD_TYPE>

// There's a guide at the bottom of this file!

export class CardShapeUtil extends ShapeUtil<ICardShape> {
	static override type = CARD_TYPE
	// [1]
	static override props = cardShapeProps
	// [2]
	static override migrations = cardShapeMigrations

	// [3]
	override isAspectRatioLocked(_shape: ICardShape) {
		return false
	}
	override canResize(_shape: ICardShape) {
		return true
	}

	// [4]
	getDefaultProps(): ICardShape['props'] {
		return {
			w: 300,
			h: 300,
			color: 'black',
		}
	}

	// [5]
	getGeometry(shape: ICardShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	// [6]
	component(shape: ICardShape) {
		const { editor } = this
		const bounds = editor.getShapeGeometry(shape).bounds
		const theme = editor.getCurrentTheme()
		const colors = theme.colors[editor.getColorMode()]
		const { color } = shape.props

		return shapeView(CardShapeComponent, {
			id: shape.id,
			width: bounds.w,
			height: bounds.h,
			backgroundColor: getColorValue(colors, color, 'semi'),
			color: getColorValue(colors, color, 'solid'),
		})
	}

	// [7]
	getIndicatorPath(shape: ICardShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}

	// [8]
	override onResize(shape: ICardShape, info: TLResizeInfo<ICardShape>) {
		return resizeBox(shape, info)
	}
}

/*
A utility class for the card shape. This is where you define the shape's behavior,
how it renders (its component and indicator), and how it handles different events.

[1]
A validation schema for the shape's props (optional)
Check out card-shape-props.ts for more info.

[2]
Migrations for upgrading shapes (optional)
Check out card-shape-migrations.ts for more info.

[3]
Letting the editor know whether the shape's aspect ratio is locked and whether it
can be resized. These are the defaults, shown here so you know they exist.

[4]
The default props the shape will be rendered with when click-creating one.

[5]
We use this to calculate the shape's geometry for hit-testing, bindings and
doing other geometric calculations.

[6]
Render method — returns a shapeView, the Svelte component (CardShape.svelte) that will be rendered
for the shape plus its props. HTMLContainer is just a div that's being used to wrap our text
and button. The colors come from the editor's current theme so the card follows dark mode.

- [a] Check it out! We can do normal Svelte stuff here like using $state (see CardShape.svelte).

- [b] You need to stop the pointer down event on buttons, otherwise the editor will
	   think you're trying to select or drag the shape. Svelte delegates `onpointerdown`, which
	   runs too late for that, so CardShape.svelte uses a native listener via an attachment.

[7]
getIndicatorPath — returns a Path2D used when hovering over the shape or when it's selected.
The path is stroked onto the canvas overlay.

[8]
Resize handler — called when the shape is resized. Sometimes you'll want to do some
custom logic here, but for our purposes, this is fine.
*/
