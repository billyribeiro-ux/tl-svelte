import { createContext } from 'svelte'

/** Identifier -> URL map set by `<CodeLinks links={...}>`; code inside links matching identifiers. */
export const [getCodeLinks, setCodeLinks, hasCodeLinks] = createContext<Record<string, string>>()

/** The 1-based line numbers `<FocusLines lines={[...]}>` keeps un-dimmed. */
export const [getFocusLines, setFocusLines, hasFocusLines] = createContext<number[] | null>()

// does this token look like a JS identifier?
export function isIdentifier(token: string): boolean {
	return /^[_$a-zA-Z\xA0-￿][_$a-zA-Z0-9\xA0-￿]*$/g.test(token)
}

// split the code into an array of identifiers, and the bits in between them
export function tokenize(code: string): string[] {
	const identifierRegex = /[_$a-zA-Z\xA0-￿][_$a-zA-Z0-9\xA0-￿]*/g

	let currentIdx = 0
	const tokens = []
	for (const identifierMatch of code.matchAll(identifierRegex)) {
		const [identifier] = identifierMatch
		const idx = identifierMatch.index
		if (idx > currentIdx) {
			tokens.push(code.slice(currentIdx, idx))
		}
		tokens.push(identifier)
		currentIdx = idx + identifier.length
	}
	if (currentIdx < code.length) {
		tokens.push(code.slice(currentIdx))
	}

	return tokens
}
