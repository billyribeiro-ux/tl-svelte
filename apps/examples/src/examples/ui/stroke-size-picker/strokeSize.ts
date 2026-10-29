import { DrawShapeUtil, StyleProp, T, drawShapeProps } from 'svelte-draw'

// [1]
export const strokeSizeStyle = StyleProp.define('example:strokeSize', {
	defaultValue: 4,
	type: T.number,
})

// [2]
declare module '@svelte-draw/tlschema' {
	interface TLDrawShapeProps {
		strokeSize: number
	}
}

// [3]
export class CustomDrawShapeUtil extends DrawShapeUtil.configure({
	getCustomDisplayValues(_editor, shape) {
		return { strokeWidth: shape.props.strokeSize }
	},
}) {
	static override props = { ...drawShapeProps, strokeSize: strokeSizeStyle }

	override getDefaultProps() {
		return { ...super.getDefaultProps(), strokeSize: strokeSizeStyle.defaultValue }
	}
}

export const shapeUtils = [CustomDrawShapeUtil]
