import { type RecordProps, Rectangle2d, ShapeUtil, T, shapeView } from 'svelte-draw'
import { contents } from './contents'
import DynamicSizeShapeComponent from './DynamicSizeShape.svelte'
import { DYNAMIC_SIZE_TYPE, SHAPE_WIDTH_PX, type DynamicSizeShape, ShapeSizes } from './ShapeSizes'

// There's a guide at the bottom of this file!

// [5]
export class DynamicSizeShapeUtil extends ShapeUtil<DynamicSizeShape> {
	// [a]
	static override type = DYNAMIC_SIZE_TYPE
	static override props: RecordProps<DynamicSizeShape> = {
		contents: T.arrayOf(T.string),
	}

	// [b]
	getDefaultProps(): DynamicSizeShape['props'] {
		return {
			contents,
		}
	}

	// [c]
	override canCull(_shape: DynamicSizeShape) {
		return false
	}

	// [d]
	override canResize(_shape: DynamicSizeShape) {
		return false
	}

	// [e]
	getGeometry(shape: DynamicSizeShape) {
		const size = ShapeSizes.get(this.editor).get(shape.id)
		return new Rectangle2d({
			width: SHAPE_WIDTH_PX,
			height: size?.height ?? 50,
			isFilled: true,
		})
	}

	// [f]
	component(shape: DynamicSizeShape) {
		return shapeView(DynamicSizeShapeComponent, { id: shape.id, contents: shape.props.contents })
	}

	// [g]
	getIndicatorPath(shape: DynamicSizeShape) {
		const { width, height } = this.editor.getShapeGeometry(shape).bounds
		const path = new Path2D()
		path.rect(0, 0, width, height)
		return path
	}
}

/*
Two pieces do the work and can be reused for other shapes: the ShapeSizes atom and the
useDynamicShapeSize function (DynamicSizeShape.svelte).

[1]
Extend TLGlobalShapePropsMap to add our shape's props to the global type system.

[2]
The shape only stores content. Its size is measured from the DOM element that renders it.

[3]
ShapeSizes is an EditorAtom holding an AtomMap from shape id to measured size. Using an
EditorAtom (rather than a module-level atom) scopes the sizes to one editor instance, and
AtomMap makes each shape's entry its own signal, so getGeometry for one shape doesn't
recompute when a different shape's size changes.

	[a] Delete a shape's entry when the shape is deleted, so the map doesn't grow forever.

[4]
useDynamicShapeSize measures a DOM element and writes its size to ShapeSizes:

	[a] offsetWidth/offsetHeight report layout size and ignore CSS transforms, so they're already
	    in shape space regardless of the camera zoom.

	[b] Writing to the atom invalidates getGeometry (see [e]) so selection bounds, hit testing,
	    and the indicator all follow the new size. We bail if nothing changed to avoid a redundant
	    store update.

	[c] Measure on every render, so the first paint already has a real size rather than the fallback.

	[d] ResizeObserver catches changes that don't go through Svelte, such as fonts loading.

[5]
The shape util:

	[a] Standard type and props. Note there is no w or h prop.

	[b] Default props with some sample content.

	[c] Never cull the shape. Culled shapes are hidden with display: none, so its element would
	    measure 0×0 and the stored size would go stale until it scrolled back into view.

	[d] Resizing is disabled because the size is not something the user controls.

	[e] getGeometry reads from ShapeSizes. Because the read happens inside a computed, the geometry
	    updates reactively when the measured size changes. Before the first measurement we fall back
	    to a fixed height.

	[f] The component renders the content and binds the measured element:

		[i] The text is animated so you can watch the selection bounds track the DOM.

		[ii] The measured element is given the shape width explicitly; only the height is dynamic.

	[g] The indicator uses the shape's geometry bounds, so it matches the measured size.

[6]
Standard setup: pass the shape util to SvelteDraw and create one shape on mount.

To reuse this in your own shape:
1. Measure your component's root element and call ShapeSizes.update, as DynamicSizeShape.svelte does.
2. Read ShapeSizes.get(this.editor).get(shape.id) in getGeometry.
3. Don't also store w/h props for the same dimension, or decide which one wins.
*/
