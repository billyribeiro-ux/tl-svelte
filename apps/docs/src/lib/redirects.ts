/**
 * Redirects and rewrites of the docs site.
 *
 * These were `redirects()` / `rewrites()` in next.config.js. The production build is static
 * (`@sveltejs/adapter-static`), so Vercel applies them from `vercel.json`, which uses the same
 * `source` / `destination` pattern syntax as Next (`:name`, `:name*`). This module is the single
 * source of truth:
 * - `scripts/write-vercel-redirects.ts` writes it into `vercel.json`,
 * - `src/hooks.server.ts` applies it in `vite dev`,
 * - `src/lib/redirects.test.ts` fails if `vercel.json` drifts from it.
 */
export interface RedirectRule {
	source: string
	destination: string
	permanent: boolean
}

export const redirects: RedirectRule[] = [
	// For backwards compatibility with old links
	{ source: '/:sectionId/ucg/:articleId', destination: '/:sectionId/:articleId', permanent: true },
	{ source: '/docs/introduction', destination: '/quick-start', permanent: true },
	{ source: '/introduction', destination: '/quick-start', permanent: true },
	{ source: '/docs/installation', destination: '/installation', permanent: true },
	{ source: '/docs/usage', destination: '/installation', permanent: true },
	{ source: '/usage', destination: '/installation', permanent: true },
	// To reflect that these are at the top level of the sidebar
	{ source: '/getting-started/:childId', destination: '/:childId', permanent: true },
	// (This is a page that we referred people to quite often)
	{ source: '/gen/editor/Editor-class', destination: '/reference/editor/Editor', permanent: true },
	{
		source: '/gen/editor/ShapeUtil-class',
		destination: '/reference/editor/ShapeUtil',
		permanent: true,
	},
	{ source: '/gen/:slug*', destination: '/reference/:slug*', permanent: true },
	// For backwards compatibility with renamed examples
	{ source: '/examples/basic/state-store', destination: '/examples/signals', permanent: true },
	// For backwards compatibility with old examples links
	{
		source: '/examples/:categoryId/:articleId',
		destination: '/examples/:articleId',
		permanent: true,
	},
	{
		source: '/examples/:categoryId/:categoryId2/:articleId',
		destination: '/examples/:articleId',
		permanent: true,
	},
	// For backwards compatibility with renamed examples
	{ source: '/examples/state-store', destination: '/examples/signals', permanent: true },
	{
		source: '/examples/basic/peristence-key',
		destination: '/examples/persistence-key',
		permanent: true,
	},
	{ source: '/examples', destination: '/examples/basic', permanent: true },
	{ source: '/reference', destination: '/reference/editor/Editor', permanent: true },
	{ source: '/docs', destination: '/quick-start', permanent: true },
	{ source: '/releases-versioning', destination: '/releases', permanent: true },
	{ source: '/jobs', destination: '/careers', permanent: true },
	{ source: '/legal/cla', destination: '/legal/contributor-license-agreement', permanent: true },
	{ source: '/legal/trademarks', destination: '/legal/trademark-guidelines', permanent: true },
	{
		source: '/codewithjason',
		destination:
			'/?utm_source=codewithjason&utm_medium=podcast&utm_campaign=steve_codewithjason_2025',
		permanent: true,
	},
	{
		source: '/diveclub',
		destination: '/?utm_source=diveclub&utm_medium=podcast&utm_campaign=steve_diveclub_2025',
		permanent: true,
	},
	{
		source: '/shoptalk',
		destination: '/?utm_source=shoptalk&utm_medium=podcast&utm_campaign=steve_shoptalk_2025',
		permanent: true,
	},
	{
		source: '/hanselminutes',
		destination:
			'/?utm_source=hanselminutes&utm_medium=paid_podcast&utm_campaign=ad_hanselminutes_2025',
		permanent: true,
	},
	{
		source: '/mostlytechnical',
		destination:
			'/?utm_source=mostlytechnical&utm_medium=paid_podcast&utm_campaign=ad_mostlytechnical_2025',
		permanent: true,
	},
	{ source: '/starter-kits', destination: '/starter-kits/overview', permanent: true },
	{ source: '/discord', destination: 'https://discord.com/invite/s4FXZ6fppJ', permanent: false },
]

export interface RewriteRule {
	source: string
	destination: string
}

/**
 * Canonical top-level URLs (/quick-start, ...) are not in the content DB; articles live under
 * /getting-started/*. Redirects send /getting-started/:id -> /:id; these rewrites serve the article
 * without a second hop. In the static build the article is prerendered at the canonical URL itself
 * (see `canonicalRouteForArticlePath`), so Vercel needs no rewrite entry for them.
 */
export const rewrites: RewriteRule[] = [
	{ source: '/quick-start', destination: '/getting-started/quick-start' },
	{ source: '/installation', destination: '/getting-started/installation' },
	{ source: '/releases', destination: '/getting-started/releases' },
]

const REWRITE_BY_SOURCE = new Map(rewrites.map((r) => [r.source, r.destination]))
const REWRITE_BY_DESTINATION = new Map(rewrites.map((r) => [r.destination, r.source]))

/** The content DB path an incoming URL path is served from (the rewrite, if there is one). */
export function resolveContentPath(pathname: string): string {
	return REWRITE_BY_SOURCE.get(pathname) ?? pathname
}

/** The URL path an article in the content DB is prerendered at (the inverse of the rewrites). */
export function canonicalRouteForArticlePath(articlePath: string): string {
	return REWRITE_BY_DESTINATION.get(articlePath) ?? articlePath
}

function escapeRegExp(text: string) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface CompiledRule {
	regex: RegExp
	names: string[]
	rule: RedirectRule
}

function compile(rule: RedirectRule): CompiledRule {
	const names: string[] = []
	let pattern = ''
	// Tokens: `/:name*` (zero or more segments), `:name` (one segment), anything else is literal.
	const tokenizer = /\/:(\w+)\*|:(\w+)|[^:/]+|\/(?!:\w+\*)/g
	for (const match of rule.source.matchAll(tokenizer)) {
		if (match[1] !== undefined) {
			names.push(match[1])
			pattern += '(?:/(.*))?'
		} else if (match[2] !== undefined) {
			names.push(match[2])
			pattern += '([^/]+)'
		} else {
			pattern += escapeRegExp(match[0])
		}
	}
	return { regex: new RegExp(`^${pattern}$`), names, rule }
}

const compiled = redirects.map(compile)

/** Finds the first redirect matching `pathname` and returns where it goes, like next.config.js did. */
export function matchRedirect(pathname: string): { location: string; permanent: boolean } | null {
	for (const { regex, names, rule } of compiled) {
		const match = regex.exec(pathname)
		if (!match) continue
		const params = new Map<string, string>()
		names.forEach((name, i) => params.set(name, match[i + 1] ?? ''))

		let location = rule.destination.replace(/(\/)?:(\w+)(\*)?/g, (_, slash, name, star) => {
			const value = params.get(name)
			if (value === undefined) return _
			// `/:slug*` with no value drops the slash too, so `/gen` becomes `/reference`.
			if (star && value === '') return ''
			return `${slash ?? ''}${value}`
		})
		if (location.length > 1 && location.endsWith('/') && !rule.destination.endsWith('/')) {
			location = location.slice(0, -1)
		}
		return { location, permanent: rule.permanent }
	}
	return null
}
