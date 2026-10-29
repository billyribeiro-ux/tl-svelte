import MarkdownIt from 'markdown-it'

// Like react-markdown's defaults: raw HTML in the source is escaped (never rendered), and
// markdown-it's built-in link validation rejects javascript:, vbscript: and file: urls. The
// descriptions come from model output, so this must stay `html: false`.
const md = new MarkdownIt({ html: false, linkify: false, breaks: false })

export function renderMarkdown(source: string): string {
	return md.render(source)
}
