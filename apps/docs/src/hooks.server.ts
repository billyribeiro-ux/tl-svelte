import type { Handle } from '@sveltejs/kit/hooks'
import { matchRedirect } from '#lib/redirects.js'

/**
 * Applies the legacy redirects in `vite dev` and `vite preview`-less setups. In production the
 * site is static and Vercel applies the same rules from `vercel.json` (see `src/lib/redirects.ts`).
 */
export const handle: Handle = async ({ event, resolve }) => {
	const redirect = matchRedirect(event.url.pathname)
	if (redirect) {
		return new Response(null, {
			status: redirect.permanent ? 308 : 307,
			headers: { location: redirect.location },
		})
	}
	return resolve(event)
}
