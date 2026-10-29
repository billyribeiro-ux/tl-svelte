import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { docsSidebarModules } from './vite-plugin-docs-sidebar.ts'

// The Next app read these through `process.env` in code that runs on both the server and the
// client (`utils/asset-url.ts`, `utils/algolia.ts`, `utils/search-api.ts`, the analytics component).
// Next inlined the `NEXT_PUBLIC_*` ones into the client bundle; Vite needs the same inlining spelled
// out. The variable names are unchanged so the existing Vercel / CI configuration keeps working.
const INLINED_ENV = [
	'ASSET_PREFIX',
	'NEXT_PUBLIC_ASSET_PREFIX',
	'NEXT_PUBLIC_DOCS_ASSET_PREFIX',
	'VERCEL_URL',
	'NEXT_PUBLIC_VERCEL_URL',
	'NEXT_PUBLIC_VERCEL_ENV',
	'NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF',
	'NEXT_PUBLIC_ALGOLIA_APP_ID',
	'NEXT_PUBLIC_ALGOLIA_SEARCH_KEY',
	'NEXT_PUBLIC_GA4_MEASUREMENT_ID',
	'NEXT_PUBLIC_GOOGLE_ADS_ID',
	'NEXT_PUBLIC_GTM_CONTAINER_ID',
]

export default defineConfig({
	define: Object.fromEntries(
		INLINED_ENV.map((name) => [`process.env.${name}`, JSON.stringify(process.env[name])])
	),
	plugins: [
		docsSidebarModules(),
		sveltekit({
			// The docs are fully prerendered: every article is known at build time (the content DB), and
			// search runs in the browser against Algolia. Nothing needs a server at runtime.
			adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', strict: true }),
			prerender: {
				// Next's `generateStaticParams` listed every page; so do we (see the catch-all route's
				// `entries`). Crawling would only add the redirected legacy URLs linked from content.
				crawl: false,
				handleHttpError: 'fail',
				handleMissingId: 'warn',
				handleUnseenRoutes: 'ignore',
			},
			// Every first-party component is written for runes. Without this, a component that happens
			// not to use a rune is compiled in legacy mode. Third-party libraries keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	server: { port: 3001 },
})
