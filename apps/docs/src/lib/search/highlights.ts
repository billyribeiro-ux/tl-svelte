import type { Hit } from 'instantsearch.js'
import { getHighlightedParts, getPropertyByPath, unescape } from 'instantsearch.js/es/lib/utils'
import type { SearchEntry } from '#utils/algolia.js'

export interface HighlightParts {
	didTruncateStart: boolean
	didMatch: boolean
	parts: { value: string; isHighlighted: boolean }[]
}

export function getHighlights(
	hit: Hit<SearchEntry>,
	attribute: 'description' | 'content',
	maxUnhighlightedPrefix: number
): HighlightParts {
	const originalProperty = hit[attribute]?.trim()
	const highlightedProperty = getPropertyByPath(hit._highlightResult, attribute as string)
	if (!highlightedProperty) {
		return {
			didMatch: false,
			didTruncateStart: false,
			parts: originalProperty ? [{ value: originalProperty, isHighlighted: false }] : [],
		}
	}

	const parts = getHighlightedParts(unescape(highlightedProperty.value || ''))

	let didTruncateStart = false
	const didMatch = parts.some((part) => part.isHighlighted)

	const initialPart = parts[0]
	// if the first part is unhighlighted and too long, we should cut it short
	if (initialPart && !initialPart.isHighlighted && didMatch) {
		const words = initialPart.value.split(' ').reverse()

		let lengthSoFar = 0
		const wordsToInclude: string[] = []
		for (const word of words) {
			lengthSoFar += word.length
			if (lengthSoFar > maxUnhighlightedPrefix) {
				break
			}
			wordsToInclude.push(word)
		}

		if (wordsToInclude.length < words.length) {
			didTruncateStart = true
			parts[0].value = `${wordsToInclude.reverse().join(' ')}`
		}
	}

	return { didTruncateStart, didMatch, parts }
}

/** Which highlights ContentHighlight shows, and whether they share two lines or take one each. */
export function chooseHighlights(hit: Hit<SearchEntry>): {
	first: HighlightParts | null
	second: HighlightParts | null
} {
	const descriptionHighlight = getHighlights(hit, 'description', 40)
	const contentHighlight = getHighlights(hit, 'content', 40)

	let first: HighlightParts | null = null
	let second: HighlightParts | null = null

	if (descriptionHighlight.didMatch === contentHighlight.didMatch) {
		// if both either matched or didn't, show whatever has actual content:
		if (descriptionHighlight.parts.length && contentHighlight.parts.length) {
			first = descriptionHighlight
			second = contentHighlight
		} else if (descriptionHighlight.parts.length) {
			first = descriptionHighlight
		} else if (contentHighlight.parts.length) {
			first = contentHighlight
		}
	} else if (descriptionHighlight.didMatch && !contentHighlight.didMatch) {
		// if only the description matched, show both because the description is short:
		first = descriptionHighlight
		second = contentHighlight
	} else {
		// otherwise, only the content matched. show just the content:
		first = contentHighlight
	}
	return { first, second }
}

/** Highlighted parts of the hit's `title`, as react-instantsearch's `<Highlight attribute="title">` computed. */
export function getTitleParts(hit: Hit<SearchEntry>) {
	const highlighted = getPropertyByPath(hit._highlightResult, 'title')
	return getHighlightedParts(unescape(highlighted?.value ?? ''))
}
