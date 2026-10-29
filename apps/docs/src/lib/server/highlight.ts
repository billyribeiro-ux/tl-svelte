import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { createHighlighterCore, hastToHtml } from 'shiki/core'
import css from 'shiki/dist/langs/css.mjs'
import svelte from 'shiki/dist/langs/svelte.mjs'
import tsx from 'shiki/dist/langs/tsx.mjs'
import ts from 'shiki/dist/langs/typescript.mjs'
import theme from 'shiki/dist/themes/github-dark.mjs'

// Highlights the example source files shown under an example. This ran in the React component with a
// synchronous highlighter; in SvelteKit it runs once per article in the server `load`.
const highlighter = createHighlighterCore({
	themes: [theme],
	langs: [ts, tsx, css, svelte],
	engine: createJavaScriptRegexEngine(),
})

function languageFor(name: string): 'css' | 'tsx' | 'svelte' | 'ts' {
	// the typescript grammar has no JSX, so .tsx/.jsx need the tsx grammar
	if (name.endsWith('.css')) return 'css'
	if (name.endsWith('.tsx') || name.endsWith('.jsx')) return 'tsx'
	if (name.endsWith('.svelte')) return 'svelte'
	return 'ts'
}

/** The inner HTML of the `<pre>` for `content`, highlighted for the file `name`. */
export async function highlightFile(name: string, content: string): Promise<string> {
	const shiki = await highlighter
	const ast = shiki.codeToHast(content, { lang: languageFor(name), theme })
	const codeElem = (ast.children[0] as any).children[0]
	return hastToHtml(codeElem)
}
