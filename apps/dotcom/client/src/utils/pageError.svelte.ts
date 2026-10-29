import { page } from '$app/state'

/**
 * The value that was thrown for the current route's `+error.svelte`, unwrapped from SvelteKit's
 * `App.Error` (`error.original`, see `hooks.client.ts`). React Router's `useRouteError()`.
 */
export function getPageError(): { readonly current: unknown } {
	return {
		get current() {
			return page.error?.original ?? page.error
		},
	}
}
