import { T } from '@svelte-draw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default vertical alignment style property used by svelte-draw shapes for text positioning.
 * Controls how text content is vertically aligned within shape boundaries.
 *
 * Available values:
 * - `start` - Align text to the top
 * - `middle` - Center text vertically (default)
 * - `end` - Align text to the bottom
 *
 * @example
 * ```ts
 * import { DefaultVerticalAlignStyle } from '@svelte-draw/tlschema'
 *
 * // Use in shape props definition
 * interface MyShapeProps {
 *   verticalAlign: typeof DefaultVerticalAlignStyle
 *   // other props...
 * }
 *
 * // Create a shape with top-aligned text
 * const shape = {
 *   // ... other properties
 *   props: {
 *     verticalAlign: 'start' as const,
 *     // ... other props
 *   }
 * }
 * ```
 *
 * @public
 */
export const DefaultVerticalAlignStyle = StyleProp.defineEnum('svelte-draw:verticalAlign', {
	defaultValue: 'middle',
	values: ['start', 'middle', 'end'],
})

/**
 * Type representing a default vertical alignment style value.
 * This is a union type of all available vertical alignment options.
 *
 * @example
 * ```ts
 * import { TLDefaultVerticalAlignStyle } from '@svelte-draw/tlschema'
 *
 * // Valid vertical alignment values
 * const topAlign: TLDefaultVerticalAlignStyle = 'start'
 * const centerAlign: TLDefaultVerticalAlignStyle = 'middle'
 * const bottomAlign: TLDefaultVerticalAlignStyle = 'end'
 *
 * // Use in a function parameter
 * function setVerticalAlignment(align: TLDefaultVerticalAlignStyle) {
 *   // Apply vertical alignment to text
 * }
 * ```
 *
 * @public
 */
export type TLDefaultVerticalAlignStyle = T.TypeOf<typeof DefaultVerticalAlignStyle>
