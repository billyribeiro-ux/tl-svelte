import {
	Box,
	type BoxModel,
	Editor,
	type ShapeView,
	type TLDefaultVerticalAlignStyle,
	type TLMeasureTextSpanOpts,
	shapeView,
} from '@svelte-draw/editor'
import TextSpansSvg, { type TextSpansSvgTspan } from './TextSpansSvg.svelte'

function correctSpacesToNbsp(input: string) {
	return input.replace(/\s/g, '\xa0')
}

export interface TLCreateTextJsxFromSpansOpts extends TLMeasureTextSpanOpts {
	verticalTextAlign: TLDefaultVerticalAlignStyle
	offsetX: number
	offsetY: number
	stroke?: string
	strokeWidth?: number
	fill?: string
}

/**
 * Get an SVG `<text>` view for a text shape. Render it with `<View view={...} />` (or return it
 * from `toSvg`). Returns null when there are no spans.
 */
export function createTextJsxFromSpans(
	_editor: Editor,
	spans: { text: string; box: BoxModel }[],
	opts: TLCreateTextJsxFromSpansOpts
): ShapeView | null {
	const { padding = 0 } = opts
	if (spans.length === 0) return null

	const bounds = Box.From(spans[0].box)
	for (const { box } of spans) {
		bounds.union(box)
	}

	const offsetX = padding + (opts.offsetX ?? 0)
	const offsetY =
		(opts.offsetY ?? 0) +
		opts.fontSize / 2 +
		(opts.verticalTextAlign === 'start'
			? padding
			: opts.verticalTextAlign === 'end'
				? opts.height - padding - bounds.height
				: (Math.ceil(opts.height) - bounds.height) / 2)

	// Create text span elements for each word
	let currentLineTop = null
	const tspans: TextSpansSvgTspan[] = []
	for (const { text, box } of spans) {
		// if we broke a line, add a line break span. This helps tools like
		// figma import our exported svg correctly
		const didBreakLine = currentLineTop !== null && box.y > currentLineTop
		if (didBreakLine) {
			tspans.push({ x: offsetX, y: box.y + offsetY, text: '\n', isText: false })
		}

		// N.B. `unicode-bidi: plaintext` (set for `isText` spans in TextSpansSvg), while discouraged
		// ("intended for Document Type Definition (DTD) designers"), is necessary for ensuring
		// correct mixed RTL/LTR behavior when exporting SVGs.
		tspans.push({
			x: box.x + offsetX,
			y: box.y + offsetY,
			text: correctSpacesToNbsp(text),
			isText: true,
		})

		currentLineTop = box.y
	}

	return shapeView(TextSpansSvg, {
		fontSize: opts.fontSize,
		fontFamily: opts.fontFamily,
		fontStyle: opts.fontStyle,
		fontWeight: opts.fontWeight,
		stroke: opts.stroke,
		strokeWidth: opts.strokeWidth,
		fill: opts.fill,
		tspans,
	})
}
