export async function load() {
	// The same `docs` sidebar the other docs pages show; a module (not server data) so it is not
	// serialised into this page's HTML.
	const { default: links } = await import('virtual:docs-sidebar/docs')
	return { links }
}
