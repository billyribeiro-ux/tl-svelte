import { ROUTES } from './routeDefs'

// The route table is the file system now: every `+page.svelte` under src/routes is a page. This
// replaces the React Router route objects the test used to walk, and produces the same
// `{ reactRouterPattern, vercelRouterPattern }` rows (the snapshot scripts/build.ts reads to write
// the Vercel SPA rewrite rules; the snapshot was carried over unchanged, which is the proof that the
// URLs are the same).
const pageFiles = Object.keys(import.meta.glob('./routes/**/+page.svelte'))

/** `./routes/(app)/(tla)/f/[fileSlug]/+page.svelte` -> `/f/:fileSlug`. */
export function routePatternFromFile(file: string): string {
	const segments = file
		.replace(/^\.\/routes\//, '')
		.replace(/\/?\+page\.svelte$/, '')
		.split('/')
		.filter((segment) => segment && !/^\(.*\)$/.test(segment))
		.map((segment) => {
			const rest = segment.match(/^\[\.\.\.(\w+)\]$/)
			if (rest) return '*'
			const param = segment.match(/^\[(\w+)\]$/)
			if (param) return `:${param[1]}`
			return segment
		})
	return '/' + segments.join('/')
}

function convertToVercel(path: string): string {
	// SvelteKit rest routes could be supported, but we don't use them for content yet.
	if (path.endsWith('*')) {
		throw new Error(`Wildcard routes like '${path}' are not supported yet (you can add support!)`)
	}
	// optional parameters (`[[x]]`) never became an app route; a trailing optional param would
	// silently lose its optionality in the Vercel pattern (use two explicit routes instead)
	if (path.includes('?')) {
		throw new Error(
			`Optional route segments like in '${path}' are not supported yet (you can add this)`
		)
	}
	// make sure colons are immediately preceded by a slash
	if (path.match(/[^/]:/)) {
		throw new Error(`Colons in route segments must be immediately preceded by a slash in '${path}'`)
	}
	if (!path.startsWith('/')) {
		throw new Error(`Route paths must start with a slash, but '${path}' does not`)
	}

	// Wrap in explicit start and end of string anchors (^ and $)
	// and replace :param with [^/]* to match any string of non-slash characters, including the empty string
	return '^' + path.replace(/:[^/]+/g, '[^/]*') + '/?$'
}

function getSpaRoutes(files: string[], { includeDevRoutes }: { includeDevRoutes: boolean }) {
	return (
		files
			.map(routePatternFromFile)
			// the root catch-all (the not-found page)
			.filter((path) => path !== '/*' && path !== '*')
			// The thumbnail render page is prerendered to its own HTML file, not served by the SPA fallback
			.filter((path) => path !== '/__thumbnail-render')
			.filter((path) => includeDevRoutes || !path.startsWith('/dev/'))
			.sort()
			.map((path) => ({
				reactRouterPattern: path,
				vercelRouterPattern: convertToVercel(path),
			}))
	)
}

const spaRoutes = getSpaRoutes(pageFiles, { includeDevRoutes: false })
const devSpaRoutes = getSpaRoutes(pageFiles, { includeDevRoutes: true })

const allVercelRouterPatterns = spaRoutes.map((route) => route.vercelRouterPattern)

function toMatchAny(received: string, regexes: string[]) {
	const pass = regexes.map((regex) => new RegExp(regex)).some((regex) => received.match(regex))
	return {
		pass,
		message: () =>
			pass
				? `expected ${received} not to match any of the regexes ${regexes}`
				: `expected ${received} to match at least one of the regexes ${regexes}`,
	}
}

const matchesAny = (value: string) => toMatchAny(value, allVercelRouterPatterns).pass

test('the_routes', () => {
	expect(spaRoutes).toMatchSnapshot()
})

test('dev reset route exists only in development routing', () => {
	expect(devSpaRoutes.map((route) => route.reactRouterPattern)).toContain('/dev/reset-local-state')
	expect(devSpaRoutes.map((route) => route.reactRouterPattern)).toContain(
		'/dev/browser-run-thumbnail'
	)
	expect(spaRoutes.map((route) => route.reactRouterPattern)).not.toContain('/dev/reset-local-state')
	expect(spaRoutes.map((route) => route.reactRouterPattern)).not.toContain(
		'/dev/browser-run-thumbnail'
	)
})

test('the thumbnail render page is not an SPA route', () => {
	// An SPA fallback for this path would mask a broken edge rewrite by quietly serving the app
	// shell, and every capture would silently pay for it again.
	expect(spaRoutes.map((route) => route.reactRouterPattern)).not.toContain('/__thumbnail-render')
	// It exists as a route, though: it is prerendered to its own HTML file.
	expect(pageFiles.map(routePatternFromFile)).toContain('/__thumbnail-render')
})

test('all routes match', () => {
	for (const route of spaRoutes) {
		expect(route.reactRouterPattern).toMatch(new RegExp(route.vercelRouterPattern))
		for (const otherRoute of spaRoutes) {
			if (route === otherRoute) continue
			expect(route.reactRouterPattern).not.toMatch(new RegExp(otherRoute.vercelRouterPattern))
		}
	}
})

test('every ROUTES entry is a page, and every page is a ROUTES entry', () => {
	const declared = new Set(Object.values(ROUTES) as string[])
	const pages = new Set(spaRoutes.map((route) => route.reactRouterPattern))
	// `/admin` and the dev routes are served but have no `ROUTES` helper, and ROUTES names routes by
	// the param names the pages use.
	const undeclared = [...pages].filter(
		(path) => !declared.has(path) && !path.startsWith('/admin') && path !== '/__debug-tail'
	)
	expect(undeclared).toEqual([])
	const missing = [...declared].filter((path) => !pages.has(path))
	expect(missing).toEqual([])
})

test("non-app routes don't match", () => {
	// lil smoke test for basic patterns
	expect(matchesAny('/')).toBe(true)
	expect(matchesAny('/new')).toBe(true)
	expect(matchesAny('/r/whatever')).toBe(true)
	expect(matchesAny('/r/whatever/')).toBe(true)

	expect(matchesAny('/assets/test.png')).toBe(false)
	expect(matchesAny('/twitter-social.png')).toBe(false)
	expect(matchesAny('/robots.txt')).toBe(false)
	expect(matchesAny('/static/css/index.css')).toBe(false)
})

test('convertToVercel', () => {
	expect(() =>
		convertToVercel('/r/:roomId/history?/:timestamp')
	).toThrowErrorMatchingInlineSnapshot(
		`[Error: Optional route segments like in '/r/:roomId/history?/:timestamp' are not supported yet (you can add this)]`
	)
	expect(() => convertToVercel('/r/:roomId/history/*')).toThrowErrorMatchingInlineSnapshot(
		`[Error: Wildcard routes like '/r/:roomId/history/*' are not supported yet (you can add support!)]`
	)
	expect(() => convertToVercel('/r/foo:roomId/history')).toThrowErrorMatchingInlineSnapshot(
		`[Error: Colons in route segments must be immediately preceded by a slash in '/r/foo:roomId/history']`
	)
	expect(() => convertToVercel('r/:roomId/history')).toThrowErrorMatchingInlineSnapshot(
		`[Error: Route paths must start with a slash, but 'r/:roomId/history' does not]`
	)
})

describe('routePatternFromFile', () => {
	it('drops groups and turns params into :params', () => {
		expect(routePatternFromFile('./routes/(app)/(tla)/(noindex)/f/[fileSlug]/+page.svelte')).toBe(
			'/f/:fileSlug'
		)
		expect(routePatternFromFile('./routes/(app)/(tla)/+page.svelte')).toBe('/')
		expect(routePatternFromFile('./routes/(app)/[...rest]/+page.svelte')).toBe('/*')
	})
})
