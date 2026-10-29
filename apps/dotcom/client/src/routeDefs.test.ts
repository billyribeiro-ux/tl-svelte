import { matchPath, ROUTES, routes } from './routeDefs'

describe('routes', () => {
	it('prefixes the origin for asUrl, with or without route params', () => {
		const origin = window.location.origin
		expect(routes.tlaSsoCallback({ asUrl: true })).toBe(`${origin}/sso-callback`)
		expect(routes.tlaRoot({ asUrl: true, searchParams: { a: '1' } })).toBe(`${origin}/?a=1`)
		expect(routes.tlaFile('abc', { asUrl: true })).toBe(`${origin}/f/abc`)
	})

	it('returns a path without asUrl', () => {
		expect(routes.tlaSsoCallback()).toBe('/sso-callback')
		expect(routes.tlaFile('abc', { searchParams: { a: '1' } })).toBe('/f/abc?a=1')
	})
})

describe('matchPath', () => {
	it('matches static routes ignoring case and trailing slashes', () => {
		expect(matchPath(ROUTES.tlaOAuthConsent, '/OAuth-Consent//')).toBe(true)
		expect(matchPath(ROUTES.tlaRoot, '/')).toBe(true)
		expect(matchPath(ROUTES.tlaRoot, '/x')).toBe(false)
	})

	it('matches params to any non-empty segment', () => {
		expect(matchPath(ROUTES.tlaFile, '/f/abc')).toBe(true)
		expect(matchPath(ROUTES.tlaFile, '/F/abc/')).toBe(true)
		expect(matchPath(ROUTES.tlaFile, '/f/')).toBe(false)
		expect(matchPath(ROUTES.tlaFile, '/f/abc/history')).toBe(false)
		expect(matchPath(ROUTES.tlaFileHistorySnapshot, '/f/abc/history/123')).toBe(true)
	})
})
