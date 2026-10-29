import type { Reroute } from '@sveltejs/kit/hooks'
import { ROUTES } from './routeDefs'

// React Router matched static segments case-insensitively, and SvelteKit does not. Without this a
// link typed as `/F/abc` or `/OAuth-Consent` (the Vercel rule for the consent page's
// X-Frame-Options header is case-insensitive for the same reason) would fall through to the 404
// page. Rewrites the pathname the router matches to the canonical casing of a known route, and
// leaves anything that matches no route alone.
const patterns = Object.values(ROUTES).map((route) => {
	const segments = route.split('/').slice(1)
	return segments.length === 1 && segments[0] === '' ? [] : segments
})

export const reroute: Reroute = ({ url }) => {
	const parts = url.pathname.split('/').slice(1)
	if (parts.at(-1) === '') parts.pop()
	for (const pattern of patterns) {
		if (pattern.length !== parts.length) continue
		const canonical: string[] = []
		let matches = true
		for (let i = 0; i < pattern.length; i++) {
			if (pattern[i].startsWith(':')) {
				if (!parts[i]) matches = false
				canonical.push(parts[i])
			} else if (pattern[i].toLowerCase() === parts[i].toLowerCase()) {
				canonical.push(pattern[i])
			} else {
				matches = false
			}
			if (!matches) break
		}
		if (matches) return '/' + canonical.join('/')
	}
}
