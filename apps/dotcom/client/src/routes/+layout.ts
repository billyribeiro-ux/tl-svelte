// The editor is browser-only (canvas, ResizeObserver, IndexedDB), Clerk and Zero only exist in the
// browser, and the deploy is static: this app is a client-side SPA with a single `index.html`
// fallback. Individual pages that must exist as their own HTML file opt back into `prerender`
// (see `__thumbnail-render`).
export const ssr = false
export const prerender = false
// React Router matched with or without a trailing slash, and so did the Vercel route patterns
// derived from the route table (`^/f/[^/]*/?$`).
export const trailingSlash = 'ignore'
