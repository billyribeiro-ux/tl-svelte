import { BaseBoxShapeUtil, StyleProp, T, type TLShape, shapeView } from 'svelte-draw'
import RatingShape from './RatingShape.svelte'

export const MY_SHAPE_WITH_CUSTOM_STYLES_TYPE = 'myshapewithcustomstyles'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[MY_SHAPE_WITH_CUSTOM_STYLES_TYPE]: {
			w: number
			h: number
			rating: MyRatingStyle
		}
	}
}

// There's a guide at the bottom of this file!

// [1]
export const myRatingStyle = StyleProp.defineEnum('example:rating', {
	defaultValue: 1,
	values: [1, 2, 3, 4, 5],
})

// [2]
export type MyRatingStyle = T.TypeOf<typeof myRatingStyle>

type IMyShape = TLShape<typeof MY_SHAPE_WITH_CUSTOM_STYLES_TYPE>

export class MyShapeUtil extends BaseBoxShapeUtil<IMyShape> {
	static override type = MY_SHAPE_WITH_CUSTOM_STYLES_TYPE

	// [3]
	static override props = {
		w: T.number,
		h: T.number,
		rating: myRatingStyle,
	}

	getDefaultProps(): IMyShape['props'] {
		return {
			w: 300,
			h: 300,
			rating: 4, // [4]
		}
	}

	component(shape: IMyShape) {
		// [5]
		const stars = ['☆', '☆', '☆', '☆', '☆']
		for (let i = 0; i < shape.props.rating; i++) {
			stars[i] = '★'
		}

		return shapeView(RatingShape, { id: shape.id, stars })
	}

	getIndicatorPath(shape: IMyShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
This file shows a custom shape that uses a custom style. For more on custom
shapes, see the custom shape example.

[1]
Our custom shape uses a new style called "rating". We create it with
StyleProp.defineEnum so that it has a fixed set of values and a default. The
id ('example:rating') must be unique across all styles in the editor.

[2]
Extract the type of the style's values so we can use it in the shape's props.

[3]
Pass the style as one of the shape's props. Any prop whose validator is a
StyleProp is treated as a style: the editor tracks it across selections and
shows it in the style panel.

[4]
Because this prop is a style, whatever value we put here in the default
props is overwritten when a shape is created: the editor uses its "style for
next shape" value instead, which is either the style's default value or the
value the user most recently set. This is special behavior just for styles.

[5]
Inside the component we read the style just like any other prop.

[6]
A custom style panel that renders the default style panel content plus a
dropdown for the rating style. useRelevantStyles returns the styles shared by
the selected shapes (or the current tool), and each entry is either a shared
value or 'mixed'. editor.setStyleForSelectedShapes writes the new value to
every selected shape, and editor.setStyleForNextShapes remembers it for shapes
created afterwards, which is what the default style panel does too. For more
on customizing the style panel, see the stroke size picker example.

[7]
Define shapeUtils and components once, outside the markup, so they aren't
recreated.

[8]
We create two shapes. The first does not specify a rating, so it gets the
editor's current value for the style, which is the style's default of 1 (not
the 4 in getDefaultProps, see [4]). The second specifies a rating of 5, so it
uses that value.
*/
