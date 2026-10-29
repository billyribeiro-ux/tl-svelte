import { interpolateName } from '@formatjs/ts-transformer'
import { transform, type Options } from '@formatjs/unplugin/transform'
import type { Plugin } from 'vite'

/**
 * `@formatjs/unplugin` for `.svelte` files.
 *
 * The stock plugin parses a module with oxc, so it handles `defineMessages({...})` in `.ts` /
 * `.svelte.ts` files and `<FormattedMessage>` in JSX, but a `.svelte` file is neither. This plugin
 * gives a Svelte file the same two treatments, with the same options, so a message gets the id
 * (`[md5:contenthash:hex:10]` of `defaultMessage#description`) and the precompiled AST wherever it
 * is declared:
 *
 * 1. Every `<script>` / `<script module>` block goes through the stock `transform` (so
 *    `defineMessages` and `formatMessage` calls there are rewritten exactly as in a `.ts` file).
 * 2. Every `<F …/>` / `<FormattedMessage …/>` tag in the markup gets an `id` attribute computed
 *    from its `defaultMessage` / `description`, and its `description` removed (the unplugin does
 *    the same to a JSX element). The `defaultMessage` stays a plain string here, not an AST: the
 *    SDK's `F.svelte` takes a string and formats it with the same lookup rules.
 *
 * It runs before the Svelte compiler (`enforce: 'pre'`), on the source text.
 */
export function formatjsSveltePlugin(options: Options = {}): Plugin {
	const componentNames = new Set(['FormattedMessage', ...(options.additionalComponentNames ?? [])])
	return {
		name: 'formatjs-svelte',
		enforce: 'pre',
		transform(code, id) {
			const file = id.split('?')[0]
			if (!file.endsWith('.svelte') || file.includes('node_modules')) return
			const result = transformSvelteMessages(code, file, options, componentNames)
			return result === code ? undefined : { code: result, map: null }
		},
	}
}

const SCRIPT_BLOCK = /<script\b[^>]*>([\s\S]*?)<\/script>/g
const STYLE_BLOCK = /<style\b[^>]*>[\s\S]*?<\/style>/g

/** Exported for the unit test. */
export function transformSvelteMessages(
	source: string,
	file: string,
	options: Options,
	componentNames: Set<string>
): string {
	// 1. script blocks, through the stock transform. Replaced from the end so offsets stay valid.
	const scripts = [...source.matchAll(SCRIPT_BLOCK)]
	let code = source
	for (const match of scripts.reverse()) {
		const start = match.index! + match[0].indexOf(match[1])
		const end = start + match[1].length
		const out = transform(match[1], `${file}.ts`, options)
		if (out) code = code.slice(0, start) + out.code + code.slice(end)
	}

	// 2. markup tags. Script and style bodies are blanked out of the scan so a `<F` in a string or
	// a CSS comment is not mistaken for a tag.
	const masked = code
		.replace(SCRIPT_BLOCK, (m) => ' '.repeat(m.length))
		.replace(STYLE_BLOCK, (m) => ' '.repeat(m.length))
	const edits: { start: number; end: number; text: string }[] = []
	const tagStart = /<([A-Za-z_$][\w$]*)(?=[\s/>])/g
	let m: RegExpExecArray | null
	while ((m = tagStart.exec(masked))) {
		if (!componentNames.has(m[1])) continue
		const attrsStart = m.index + m[0].length
		const tagEnd = findTagEnd(masked, attrsStart)
		if (tagEnd === -1) continue
		const attrs = parseAttributes(masked, attrsStart, tagEnd)
		const defaultMessage = attrs.get('defaultMessage')?.value
		const description = attrs.get('description')
		const existingId = attrs.get('id')?.value
		if (defaultMessage === undefined || existingId !== undefined) {
			// Nothing to derive an id from, or the author already wrote one (SDK-style ids).
			if (description) edits.push(removeAttribute(masked, description))
			continue
		}
		const normalised = defaultMessage.trim().replace(/\s+/gm, ' ')
		const idPattern = options.idInterpolationPattern
		if (!idPattern) continue
		const id = interpolateName({ resourcePath: file } as never, idPattern, {
			content: description?.value ? `${normalised}#${description.value}` : normalised,
		})
		edits.push({ start: attrsStart, end: attrsStart, text: ` id=${JSON.stringify(id)}` })
		if (description) edits.push(removeAttribute(masked, description))
		tagStart.lastIndex = tagEnd
	}
	edits.sort((a, b) => b.start - a.start)
	for (const edit of edits) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end)
	return code
}

interface Attribute {
	name: string
	/** The static string value, or undefined when it is a dynamic expression. */
	value: string | undefined
	start: number
	end: number
}

/** Finds the `>` that closes the tag whose attributes start at `from`, skipping strings and `{}`. */
function findTagEnd(text: string, from: number): number {
	let depth = 0
	let quote: string | null = null
	for (let i = from; i < text.length; i++) {
		const c = text[i]
		if (quote) {
			if (c === '\\' && depth > 0) i++
			else if (c === quote) quote = null
			continue
		}
		if (c === '"' || c === "'" || (c === '`' && depth > 0)) quote = c
		else if (c === '{') depth++
		else if (c === '}') depth = Math.max(0, depth - 1)
		else if (c === '>' && depth === 0) return i
	}
	return -1
}

const ATTRIBUTE =
	/([A-Za-z_$][\w$-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`([^`$\\]*)`)\s*\})/g

function parseAttributes(text: string, from: number, to: number): Map<string, Attribute> {
	const map = new Map<string, Attribute>()
	const slice = text.slice(from, to)
	for (const m of slice.matchAll(ATTRIBUTE)) {
		const raw = m[2] ?? m[3] ?? m[4] ?? m[5] ?? m[6]
		map.set(m[1], {
			name: m[1],
			value:
				raw === undefined ? undefined : unescape(raw, m[4] !== undefined || m[5] !== undefined),
			start: from + m.index!,
			end: from + m.index! + m[0].length,
		})
	}
	return map
}

function unescape(raw: string, isJsString: boolean) {
	return isJsString ? raw.replace(/\\(.)/g, '$1') : raw
}

function removeAttribute(text: string, attr: Attribute) {
	let start = attr.start
	while (start > 0 && /[ \t]/.test(text[start - 1])) start--
	if (start > 0 && text[start - 1] === '\n') start--
	return { start, end: attr.end, text: '' }
}
