import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './renderMarkdown'

describe('renderMarkdown', () => {
	it('renders basic markdown', () => {
		expect(renderMarkdown('**bold** and `code`')).toBe(
			'<p><strong>bold</strong> and <code>code</code></p>\n'
		)
	})

	it('escapes raw html from the model instead of rendering it', () => {
		const html = renderMarkdown('<img src=x onerror="alert(1)"> <script>alert(2)</script>')
		expect(html).not.toContain('<img')
		expect(html).not.toContain('<script')
		expect(html).toContain('&lt;img')
	})

	it('does not turn javascript: urls into links', () => {
		const html = renderMarkdown('[click](javascript:alert(1))')
		expect(html).not.toContain('<a')
		expect(html).not.toContain('href')
	})

	it('keeps https links', () => {
		expect(renderMarkdown('[x](https://example.com)')).toContain('href="https://example.com"')
	})
})
