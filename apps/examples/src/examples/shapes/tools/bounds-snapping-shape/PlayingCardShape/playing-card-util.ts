import {
	BaseBoxShapeUtil,
	type BoundsSnapGeometry,
	type RecordProps,
	Rectangle2d,
	T,
	type TLShape,
	shapeView,
} from 'svelte-draw'
import PlayingCard from './PlayingCard.svelte'

// There's a guide at the bottom of this file!

export const PLAYING_CARD_TYPE = 'PlayingCard'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[PLAYING_CARD_TYPE]: {
			w: number
			h: number
			suit: string
		}
	}
}

// [2]
export type IPlayingCard = TLShape<typeof PLAYING_CARD_TYPE>

export class PlayingCardUtil extends BaseBoxShapeUtil<IPlayingCard> {
	// [3]
	static override type = PLAYING_CARD_TYPE
	static override props: RecordProps<IPlayingCard> = {
		w: T.number,
		h: T.number,
		suit: T.string,
	}

	// [4]
	override isAspectRatioLocked(_shape: IPlayingCard) {
		return true
	}

	// [5]
	getDefaultProps(): IPlayingCard['props'] {
		const cardSuitsArray: string[] = ['♠️', '♣️', '♥️', '♦️']
		const randomSuit = cardSuitsArray[Math.floor(Math.random() * cardSuitsArray.length)]
		return {
			w: 270,
			h: 370,
			suit: randomSuit,
		}
	}

	// [6]
	override getBoundsSnapGeometry(shape: IPlayingCard): BoundsSnapGeometry {
		return {
			points: new Rectangle2d({
				width: shape.props.h / 4.5,
				height: shape.props.h / 4.5,
				isFilled: true,
			}).bounds.cornersAndCenter,
		}
	}

	// [7]
	component(shape: IPlayingCard) {
		return shapeView(PlayingCard, {
			id: shape.id,
			w: shape.props.w,
			h: shape.props.h,
			suit: shape.props.suit,
		})
	}

	// [8]
	getIndicatorPath(shape: IPlayingCard) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
This is a utility class for the PlayingCard shape. This is where you define the shape's behavior,
how it renders (its component and indicator), and how it handles different events. The most relevant
part of the code to custom snapping can be found in [6].

[1]
First, we extend TLGlobalShapePropsMap to add our shape's props to the global type system. For this
shape, we define width (w), height (h), and suit as the shape's properties.

[2]
Define the shape type using TLShape with the shape's type as a type argument.

[3]
We define the shape's type and props for the editor. The validators make sure the store always has
shape data we can trust: width and height are numbers, and suit is a string.

[4]
We lock the aspect ratio so cards keep their proportions when resized.

[5]
getDefaultProps determines what our shape looks like when click-creating one. In this case, we
want the shape to be 270x370 pixels with a random suit.

[6]
This is the important part for custom snapping. getBoundsSnapGeometry returns the points that the
shape snaps to and that other shapes snap against, instead of the default bounding box. Here it's
the corners and center of the square in the top left that contains the suit, the same size as the
span defined in [7]. That's what lets a card snap into place just below or beside another card's
suit icon.

[7]
The component method controls what the shape looks like. It returns a shapeView of PlayingCard.svelte: a div with the suit in the
center and a span with the suit in the top left, inside an HTMLContainer, a div wrapper that the
svelte-draw library exports with the css needed to position it correctly.

[8]
getIndicatorPath returns a Path2D for the blue outline that appears around the shape when it's
selected or hovered. svelte-draw strokes it onto the canvas overlay.
*/
