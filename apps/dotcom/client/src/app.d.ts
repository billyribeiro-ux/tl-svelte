/// <reference types="vite/client" />

declare module 'md5.js'

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace App {
		/**
		 * What `handleError` in `hooks.client.ts` returns, and so what `+error.svelte`, `page.error` and a
		 * `<svelte:boundary>` `failed` snippet receive for a route-level failure.
		 *
		 * React Router handed its error boundary the thrown value itself, and the app relies on
		 * `instanceof` / `.name` / `.reason` of it (`TlaNotFoundError`, `RemoteSyncError`, see
		 * `utils/routeErrors.ts`). SvelteKit would replace it with a serialisable `{ message }`, so the
		 * hook keeps the original on `original`.
		 */
		interface Error {
			message: string
			/** The value that was thrown (or the `Response` of a failed load). Client-side only. */
			original?: unknown
		}

		/** Data carried in `history.state` by an in-app navigation (React Router's `location.state`). */
		interface PageState {
			/** Set by `/import` so that `/` runs the import once the app has loaded. */
			importUrl?: string
			/** Set by `utils/redirect.ts` to ask `/` to open the sign-in dialog. */
			openSignIn?: boolean
			/** Set by the last-visited-file shortcut in `pages/local`; read by `TlaFileSyncHost`. */
			[key: string]: unknown
		}
	}
}

export {}
