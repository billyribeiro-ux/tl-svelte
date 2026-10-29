import DOMPurify from 'dompurify'
import { Marked } from 'marked'

// Like react-markdown, we don't render raw HTML that appears in the markdown source: it is dropped.
const marked = new Marked({
	gfm: true,
	renderer: {
		html: () => '',
	},
})

/**
 * Converts markdown to HTML that is safe to insert with `{@html}`. Model output is untrusted, so
 * the result is sanitized as well.
 */
export function renderMarkdown(markdown: string): string {
	return DOMPurify.sanitize(marked.parse(markdown, { async: false }))
}
