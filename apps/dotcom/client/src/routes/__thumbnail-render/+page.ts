// The render page must exist as its own HTML file (`__thumbnail-render.html`) so the edge can serve
// it without the SPA fallback: an SPA fallback for this path would mask a broken edge rewrite by
// quietly serving the app shell, and every capture would silently pay for it again. The root layout
// has `ssr = false`, so prerendering emits only the shell and the page renders in the browser.
export const prerender = true
