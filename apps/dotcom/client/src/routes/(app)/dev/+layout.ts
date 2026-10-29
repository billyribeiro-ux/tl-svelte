import { error } from '@sveltejs/kit'

// The dev tooling pages only exist in development. Elsewhere the URL falls through to the not-found
// page, as it did when the routes were only registered `if (import.meta.env.DEV)`.
export function load() {
	if (!import.meta.env.DEV) error(404, 'Not Found')
}
