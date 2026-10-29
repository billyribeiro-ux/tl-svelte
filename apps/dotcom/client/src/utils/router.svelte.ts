import { goto } from '$app/navigation'
import { page } from '$app/state'

/**
 * The React Router hooks the app used (`useNavigate`, `useLocation`, `useParams`, `useSearchParams`)
 * as plain module exports over SvelteKit's `$app/state`. They are reactive when read in a template,
 * `$derived` or `$effect`, and need no call during component initialisation.
 *
 * | React Router                       | here                                          |
 * | ---------------------------------- | --------------------------------------------- |
 * | `const navigate = useNavigate()`   | `navigate(to, { replace, state })`            |
 * | `useLocation()`                    | `location.pathname / .search / .hash / .state`|
 * | `useParams()`                      | `params.fileSlug`                             |
 * | `useSearchParams()`                | `searchParams` (read) + `setSearchParams(fn)` |
 * | `<Link to>` / `<NavLink>`          | `<a href>` (SvelteKit intercepts the click)   |
 * | `<Navigate to replace />`          | `navigate(to, { replace: true })` in an effect|
 */

export interface NavigateOptions {
	/** Replace the current history entry instead of pushing a new one. */
	replace?: boolean
	/**
	 * Becomes `location.state` on the destination. Persisted in `history.state` and restored after a
	 * reload, like React Router's.
	 */
	state?: App.PageState
}

/**
 * Navigates to an in-app url. `'.'` means the current route's pathname (React Router resolves it
 * against the route, a browser would resolve it against the url's directory). A number moves
 * through history, like `navigate(-1)`.
 */
export function navigate(to: string | number, options: NavigateOptions = {}): Promise<void> {
	if (typeof to === 'number') {
		history.go(to)
		return Promise.resolve()
	}
	const target = to === '.' ? page.url.pathname : to
	return goto(target, {
		replace: options.replace,
		state: options.state,
		// `location.state` survived a reload in React Router, it lives in `history.state`.
		persistState: options.state !== undefined,
	})
}

/** Reactive view of `window.location` plus the navigation `state`, shaped like React Router's `useLocation()`. */
export const location = {
	get pathname() {
		return page.url.pathname
	},
	get search() {
		return page.url.search
	},
	get hash() {
		return page.url.hash
	},
	get href() {
		return page.url.href
	},
	/** Never null: an entry without state has `{}`. */
	get state(): App.PageState {
		return page.state
	},
}

/** The matched route's params, e.g. `params.fileSlug` on `/f/[fileSlug]`. `undefined` when absent. */
export const params: { readonly [name: string]: string | undefined } = new Proxy(
	{},
	{
		get: (_target, name) =>
			typeof name === 'string'
				? (page.params as Record<string, string | undefined> | undefined)?.[name]
				: undefined,
	}
)

/** The current query string. Read-only: change it with {@link setSearchParams}. */
export const searchParams = {
	get current() {
		return page.url.searchParams
	},
	get(name: string) {
		return page.url.searchParams.get(name)
	},
	has(name: string) {
		return page.url.searchParams.has(name)
	},
	toString() {
		return page.url.searchParams.toString()
	},
}

/**
 * Like the setter from `useSearchParams()`: pass the new params, or a function from the current ones.
 * Keeps the pathname, hash and `state`.
 */
export function setSearchParams(
	next: URLSearchParams | ((current: URLSearchParams) => URLSearchParams | void),
	options: { replace?: boolean } = {}
) {
	const params = new URLSearchParams(page.url.searchParams.toString())
	const result = typeof next === 'function' ? (next(params) ?? params) : next
	const search = result.toString()
	return goto(`${page.url.pathname}${search ? `?${search}` : ''}${page.url.hash}`, {
		replace: options.replace ?? false,
		state: page.state,
		persistState: true,
		// Same page, same data: the search params are for components to read.
		reset: false,
	})
}
