import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
	canonicalRouteForArticlePath,
	matchRedirect,
	redirects,
	resolveContentPath,
} from './redirects'

describe('matchRedirect', () => {
	it.each([
		['/docs', '/quick-start'],
		['/introduction', '/quick-start'],
		['/getting-started/installation', '/installation'],
		['/gen/editor/Editor-class', '/reference/editor/Editor'],
		['/gen/editor/Foo/bar', '/reference/editor/Foo/bar'],
		['/gen', '/reference'],
		['/examples', '/examples/basic'],
		['/examples/basic/state-store', '/examples/signals'],
		['/examples/basic/some-example', '/examples/some-example'],
		['/examples/a/b/some-example', '/examples/some-example'],
		['/docs/ucg/editor', '/docs/editor'],
		['/starter-kits', '/starter-kits/overview'],
		['/jobs', '/careers'],
	])('%s -> %s', (from, to) => {
		expect(matchRedirect(from)?.location).toBe(to)
	})

	it('keeps query strings of marketing redirects and the temporary status of /discord', () => {
		expect(matchRedirect('/shoptalk')?.location).toContain('utm_source=shoptalk')
		expect(matchRedirect('/discord')).toEqual({
			location: 'https://discord.com/invite/s4FXZ6fppJ',
			permanent: false,
		})
	})

	it('does not redirect real article paths', () => {
		for (const p of [
			'/docs/editor',
			'/quick-start',
			'/reference/editor/Editor',
			'/examples/signals',
		]) {
			expect(matchRedirect(p)).toBeNull()
		}
	})
})

describe('rewrites', () => {
	it('serves the canonical URLs from the getting-started articles and back', () => {
		expect(resolveContentPath('/quick-start')).toBe('/getting-started/quick-start')
		expect(canonicalRouteForArticlePath('/getting-started/releases')).toBe('/releases')
		expect(resolveContentPath('/docs/editor')).toBe('/docs/editor')
	})
})

describe('vercel.json', () => {
	it('lists exactly the redirects of src/lib/redirects.ts (run `pnpm check-redirects` after editing)', () => {
		const vercel = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'))
		expect(vercel.redirects).toEqual(redirects)
	})
})
