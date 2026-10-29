import {
	Group2d,
	Polygon2d,
	type RecordPropsType,
	Rectangle2d,
	ShapeUtil,
	T,
	type TLResizeInfo,
	type TLShape,
	Vec,
	resizeBox,
	shapeView,
} from 'svelte-draw'
import HouseShapeComponent from './HouseShapeComponent.svelte'

export const HOUSE_TYPE = 'house'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[HOUSE_TYPE]: HouseShapeProps
	}
}

const houseShapeProps = {
	w: T.number,
	h: T.number,
}

type HouseShapeProps = RecordPropsType<typeof houseShapeProps>
type HouseShape = TLShape<typeof HOUSE_TYPE>
export class HouseShapeUtil extends ShapeUtil<HouseShape> {
	static override type = HOUSE_TYPE
	static override props = houseShapeProps

	override getDefaultProps() {
		return {
			w: 100,
			h: 100,
		}
	}
	//[1]
	override getGeometry(shape: HouseShape) {
		const { house: houseGeometry } = getHouseVertices(shape)
		const house = new Polygon2d({
			points: houseGeometry,
			isFilled: true,
		})
		const door = new Rectangle2d({
			x: shape.props.w / 2 - shape.props.w / 10,
			y: shape.props.h - shape.props.h / 4,
			width: shape.props.w / 5,
			height: shape.props.h / 4,
			isFilled: true,
		})
		const geometry = new Group2d({
			children: [house, door],
		})
		return geometry
	}
	// [2]
	override component(shape: HouseShape) {
		const { house: houseVertices, door: doorVertices } = getHouseVertices(shape)
		const housePathData = 'M' + houseVertices[0] + 'L' + houseVertices.slice(1) + 'Z'
		const doorPathData = 'M' + doorVertices[0] + 'L' + doorVertices.slice(1) + 'Z'
		return shapeView(HouseShapeComponent, { d: housePathData + doorPathData })
	}
	// [3]
	override getIndicatorPath(shape: HouseShape) {
		const { house: houseVertices, door: doorVertices } = getHouseVertices(shape)
		const housePathData = 'M' + houseVertices[0] + 'L' + houseVertices.slice(1) + 'Z'
		const doorPathData = 'M' + doorVertices[0] + 'L' + doorVertices.slice(1) + 'Z'
		return new Path2D(housePathData + doorPathData)
	}
	override onResize(shape: HouseShape, info: TLResizeInfo<HouseShape>) {
		return resizeBox(shape, info)
	}
}
// [4]
function getHouseVertices(shape: HouseShape): { house: Vec[]; door: Vec[] } {
	const { w, h } = shape.props
	const halfW = w / 2
	const roofStart = h / 2.5
	const house = [
		new Vec(0, roofStart), // Roof start (left)
		new Vec(w, roofStart), // Roof start (right)
		new Vec(w, h), // Bottom-right corner
		new Vec(0, h), // Bottom-left corner
		new Vec(0, roofStart), // Roof start (left)
		new Vec(halfW, 0), // Roof peak
		new Vec(w, roofStart), // Roof start (right)
	]
	const door = [
		new Vec(halfW - w / 10, h), // Bottom-left corner
		new Vec(halfW + w / 10, h), // Bottom-right corner
		new Vec(halfW + w / 10, h - h / 4), // Top-right corner
		new Vec(halfW - w / 10, h - h / 4), // Top-left corner
		new Vec(halfW - w / 10, h), // Bottom-left corner
	]
	return { house, door }
}
