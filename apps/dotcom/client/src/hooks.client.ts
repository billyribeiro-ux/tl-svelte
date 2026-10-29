import type { HandleClientError } from '@sveltejs/kit/hooks'
import '../sentry.client.config'
import { TlaNotFoundError } from './tla/utils/notFoundError'
import { markFirstLoad } from './utils/firstLoad'
import { captureRouteError } from './utils/routeErrors'

markFirstLoad('js-started')

/**
 * Every route-level failure (a `load` that throws, a render error that reaches `+error.svelte`)
 * passes through here, the way it passed through React Router's `ErrorBoundary`.
 *
 * React handed the boundary the thrown value itself and the app inspects it (`instanceof
 * TlaNotFoundError`, `error.name === 'RemoteSyncError'`, `error.reason`). SvelteKit would reduce it
 * to `{ message }`, so the original rides along on `original` (see `App.Error`).
 */
export const handleError: HandleClientError = (input) => {
	if (input.kind === 'unknown') {
		const { error } = input
		// Expected errors (a deleted file, a visitor who must sign in...) are not faults.
		captureRouteError(error)
		return {
			status: error instanceof TlaNotFoundError ? 404 : 500,
			message: error instanceof Error ? error.message : 'Internal Error',
			original: error,
		}
	}
	// App and framework errors (a 404 for no route, `error(...)`) are already safe to show.
	return { ...input.error, original: input.error }
}
