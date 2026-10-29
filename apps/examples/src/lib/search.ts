import type { Example } from './examples.js'

const ignoredSearchTerms = new Set(['a', 'the'])

export function getSearchTerms(value: string) {
	return value
		.trim()
		.toLowerCase()
		.split(/\s+/)
		.filter((term) => term.length > 0 && !ignoredSearchTerms.has(term))
}

export function exampleMatchesSearch(example: Example, searchTerms: string[]) {
	if (!searchTerms.length) return true

	const title = example.title.toLowerCase()
	const keywords = example.keywords.map((keyword) => keyword.toLowerCase())

	return searchTerms.some((term) => {
		return title.includes(term) || keywords.some((keyword) => keyword.includes(term))
	})
}

export function getSearchMatchRanges(text: string, searchTerms: string[]) {
	const lowerText = text.toLowerCase()
	const ranges: Array<[number, number]> = []

	for (const term of searchTerms) {
		let matchIndex = lowerText.indexOf(term)
		while (matchIndex !== -1) {
			ranges.push([matchIndex, matchIndex + term.length])
			matchIndex = lowerText.indexOf(term, matchIndex + term.length)
		}
	}

	if (!ranges.length) return ranges

	ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1])

	const mergedRanges: Array<[number, number]> = []
	for (const [start, end] of ranges) {
		const previous = mergedRanges[mergedRanges.length - 1]
		if (!previous || start > previous[1]) {
			mergedRanges.push([start, end])
		} else if (end > previous[1]) {
			previous[1] = end
		}
	}

	return mergedRanges
}

export interface HighlightPart {
	text: string
	match: boolean
}

/** Splits `text` into plain and matching parts, for rendering matches in a `<strong>`. */
export function getHighlightParts(text: string, searchTerms: string[]): HighlightPart[] {
	const matchRanges = getSearchMatchRanges(text, searchTerms)
	const parts: HighlightPart[] = []
	let cursor = 0

	for (const [start, end] of matchRanges) {
		if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false })
		parts.push({ text: text.slice(start, end), match: true })
		cursor = end
	}

	if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })

	return parts
}
