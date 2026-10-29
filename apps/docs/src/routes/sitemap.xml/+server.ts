import { db } from '#utils/ContentDatabase.js'
import { canonicalizeDocsSitemapPaths } from '#utils/sitemap-canonical-paths.js'
import type { RequestHandler } from './$types'

export const prerender = true

const SITE_ORIGIN = 'https://svelte-draw.invalid'

function escapeXml(text: string) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const GET: RequestHandler = async () => {
	const paths = canonicalizeDocsSitemapPaths(await db.getAllPaths())
	const lastModified = new Date().toISOString()

	// Docs-only sitemap. Marketing pages are now owned by the dotdev app.
	const urls = ['/', ...paths].map(
		(path) =>
			`<url><loc>${escapeXml(SITE_ORIGIN + (path === '/' ? '/' : path))}</loc><lastmod>${lastModified}</lastmod></url>`
	)

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
		{ headers: { 'content-type': 'application/xml' } }
	)
}
