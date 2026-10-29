import { Fragment, Node, type Schema } from '@tiptap/pm/model'
import {
	getSchema,
	tipTapDefaultExtensions,
	type Editor,
	type ExtractShapeByProps,
	type JSONContent,
	type TLRichText,
	type TLShape,
	type TLShapeId,
} from 'svelte-draw'

export const schema = getSchema(tipTapDefaultExtensions)

export type Style = 'bold' | 'italic' | 'highlight'

export const STYLES: { style: Style; icon: string; label: string }[] = [
	{ style: 'bold', icon: 'bold', label: 'Bold' },
	{ style: 'italic', icon: 'italic', label: 'Italic' },
	{ style: 'highlight', icon: 'highlight', label: 'Highlight' },
]

type RichTextShape = ExtractShapeByProps<{ richText: TLRichText }>

export function isRichTextShape(shape: TLShape): shape is RichTextShape {
	return 'richText' in shape.props
}

function isUniformlyMarked(doc: Node, markName: string): boolean {
	let hasText = false
	let allMarked = true
	doc.descendants((node) => {
		if (node.isText) {
			hasText = true
			if (!node.marks.some((m) => m.type.name === markName)) {
				allMarked = false
			}
		}
	})
	return hasText && allMarked
}

// [1]
function setMark(doc: Node, schema: Schema, markName: string, active: boolean): Node {
	const markType = schema.marks[markName]

	return mapTextNodes(doc, schema, (node) => {
		if (active) {
			return node.mark(markType.create().addToSet(node.marks))
		} else {
			return node.mark(node.marks.filter((m) => m.type !== markType))
		}
	})
}

function mapTextNodes(node: Node, schema: Schema, fn: (textNode: Node) => Node): Node {
	if (node.isText) return fn(node)
	if (node.content.size === 0) return node
	const children: Node[] = []
	node.content.forEach((child) => {
		children.push(mapTextNodes(child, schema, fn))
	})
	return node.copy(Fragment.from(children))
}

// [2]
export function setMarkOnShape(editor: Editor, id: TLShapeId, style: Style, active: boolean) {
	const shape = editor.getShape(id)
	if (!shape) return
	if (isRichTextShape(shape)) {
		const richText = shape.props.richText
		const doc = Node.fromJSON(schema, richText as JSONContent)
		const updated = setMark(doc, schema, style, active)
		editor.updateShape({
			id,
			type: shape.type,
			props: { richText: updated.toJSON() },
		})
	} else {
		editor
			.getSortedChildIdsForParent(id)
			.forEach((childId) => setMarkOnShape(editor, childId, style, active))
	}
}

export function isUniformlyStyled(editor: Editor, shapeId: TLShapeId, style: Style) {
	const shape = editor.getShape(shapeId)
	if (!shape || !isRichTextShape(shape)) return false
	const doc = Node.fromJSON(schema, shape.props.richText as JSONContent)
	return isUniformlyMarked(doc, style)
}
