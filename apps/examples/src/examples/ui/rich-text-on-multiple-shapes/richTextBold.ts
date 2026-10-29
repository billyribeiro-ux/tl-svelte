import type { TLRichText } from 'svelte-draw'

// [1]
export function makeAllTextBold(richText: TLRichText): TLRichText {
	if (!richText || !richText.content) {
		return richText
	}

	const processNode = (node: any): any => {
		if (node.type === 'text') {
			const hasBold = node.marks?.some((mark: any) => mark.type === 'bold')
			if (hasBold) {
				return node
			}
			return {
				...node,
				marks: [...(node.marks || []), { type: 'bold' }],
			}
		}

		if (node.content && Array.isArray(node.content)) {
			return {
				...node,
				content: node.content.map(processNode),
			}
		}

		return node
	}

	return {
		...richText,
		content: richText.content.map(processNode),
	}
}

export function isAllTextBold(richText: TLRichText): boolean {
	if (!richText || !richText.content) {
		return false
	}

	const checkNode = (node: any): boolean => {
		if (node.type === 'text') {
			return node.marks?.some((mark: any) => mark.type === 'bold') ?? false
		}

		if (node.content && Array.isArray(node.content)) {
			return node.content.every(checkNode)
		}

		// Leaf nodes without text (hard breaks, etc.) have nothing to bold
		return true
	}

	return richText.content.every(checkNode)
}

export function removeBoldFromAllText(richText: TLRichText): TLRichText {
	if (!richText || !richText.content) {
		return richText
	}

	const processNode = (node: any): any => {
		if (node.type === 'text') {
			const marks = node.marks?.filter((mark: any) => mark.type !== 'bold') || []
			return {
				...node,
				marks: marks.length > 0 ? marks : undefined,
			}
		}

		if (node.content && Array.isArray(node.content)) {
			return {
				...node,
				content: node.content.map(processNode),
			}
		}

		return node
	}

	return {
		...richText,
		content: richText.content.map(processNode),
	}
}
