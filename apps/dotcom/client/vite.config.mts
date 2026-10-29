import path from 'path'
import { fileURLToPath } from 'url'
import formatjs from '@formatjs/unplugin/vite'
import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { config } from 'dotenv'
import { defineConfig, Plugin } from 'vite'
import { getMultiplayerServerURL } from './scripts/multiplayer-server-url'
import { formatjsSveltePlugin } from './scripts/vite-formatjs-svelte-plugin'
import { thumbnailScreenshotPlugin } from './scripts/vite-thumbnail-screenshot-plugin'
import { zodLocalePlugin } from './scripts/vite-zod-locale-plugin.js'

export { getMultiplayerServerURL }

config({
	path: './.env.local',
})

const FORMATJS_OPTIONS = {
	idInterpolationPattern: '[md5:contenthash:hex:10]',
	additionalComponentNames: ['F'],
	ast: true,
}

const multiplayerServerProxyTarget = getMultiplayerServerURL() || 'http://127.0.0.1:8787'

/**
 * Plugin to enable SPA fallback for vite preview.
 * In dev mode, Vite handles SPA routing automatically.
 * In preview mode, we need to rewrite page-like URLs to /index.html
 * so the static file server (sirv) serves the SPA entry point.
 */
function spaFallbackPlugin(): Plugin {
	return {
		name: 'spa-fallback',
		configurePreviewServer(server) {
			// This runs BEFORE the static file server (sirv) is added
			server.middlewares.use((req, res, next) => {
				const url = req.url || '/'
				const pathname = url.split('?')[0]
				const ext = path.extname(pathname)

				// If this looks like a page request (no file extension, not an api call),
				// rewrite to index.html so sirv serves the SPA.
				//
				// The well-known exclusion is not cosmetic: this middleware runs ahead of the proxy, so
				// without it the MCP server's OAuth metadata URL — extensionless, and not under /api —
				// would be answered with the SPA's index.html. A client would parse that as a failed
				// discovery and never find the authorization server, with nothing logged either side.
				if (!pathname.startsWith('/api') && !pathname.startsWith('/.well-known/') && !ext) {
					req.url = '/index.html' + (url.includes('?') ? url.substring(url.indexOf('?')) : '')
				}
				next()
			})
		},
	}
}

function urlOrLocalFallback(mode: string, url: string | undefined, localFallbackPort: number) {
	if (url) {
		return JSON.stringify(url)
	}

	if (mode === 'development') {
		// in dev, vite lets us inline javascript expressions - so we return a template string that
		// will be evaluated on the client
		return '`http://${location.hostname}:' + localFallbackPort + '`'
	} else {
		// in production, we have to fall back to a hardcoded value
		return JSON.stringify(`http://localhost:${localFallbackPort}`)
	}
}

// https://vitejs.dev/config/
export default defineConfig((env) => ({
	plugins: [
		spaFallbackPlugin(),
		thumbnailScreenshotPlugin(),
		zodLocalePlugin(fileURLToPath(new URL('./scripts/zod-locales-shim.js', import.meta.url))),
		// `ast: true` precompiles this app's own messages, which is why it doesn't need the ICU
		// parser for them. It can't be aliased away (`icu-messageformat-parser/no-parser.js`) all
		// the same: the SDK's catalogue ships as raw ICU strings, and without a parser every one of
		// them that has a placeholder formats to its own source — a screen reader announced
		// "{num, plural, one {# shape selected} other {# shapes selected}}" verbatim. The parser
		// measured 8.5KB gzipped across the bundle, which is the price of that not happening.
		//
		// The two plugins share their options on purpose: `@formatjs/unplugin` only sees `.ts` / `.js`
		// modules, and `formatjsSveltePlugin` is the same transform for the `<script>` blocks and
		// `<F>` / `<FormattedMessage>` tags of `.svelte` files, so a message gets the same id wherever
		// it is declared.
		formatjs(FORMATJS_OPTIONS),
		formatjsSveltePlugin(FORMATJS_OPTIONS),
		// Browser-only SPA: the editor needs canvas, ResizeObserver and friends, so nothing is
		// rendered on a server. `fallback: 'index.html'` is the SPA entry that Vercel's build output
		// config (scripts/build.ts) serves for every app route, exactly like the Vite `index.html` it
		// replaces. adapter-static is the right adapter because the deploy is a static `.vercel/output`
		// directory plus routing rules written by scripts/build.ts; there is no server code to host.
		sveltekit({
			adapter: adapter({ pages: 'dist', assets: 'dist', fallback: 'index.html', precompress: false }),
			// Every first-party component is written for runes. Without this, a component that happens
			// not to use a rune is compiled in legacy mode, where mutating a top-level variable makes it
			// reactive. Third-party libraries in node_modules keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
			// The `public` folder keeps its name (it was Vite's `publicDir`): the i18n scripts under
			// internal/scripts write and read `public/tla/locales*`.
			files: { assets: 'public' },
		}),
	],
	build: {
		// output source maps to .map files and include //sourceMappingURL comments in JavaScript files
		// these get uploaded to Sentry and can be used for debugging
		sourcemap: true,

		// our svg icons break if we use data urls, so disable inline assets for now
		assetsInlineLimit: 0,
	},
	// add backwards-compatible support for NEXT_PUBLIC_ env vars
	define: {
		...Object.fromEntries(
			Object.entries(process.env)
				.filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
				.map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
		),
		'process.env.MULTIPLAYER_SERVER': urlOrLocalFallback(env.mode, getMultiplayerServerURL(), 8787),
		'process.env.ZERO_SERVER': urlOrLocalFallback(env.mode, process.env.ZERO_SERVER, 4848),
		'process.env.USER_CONTENT_URL': urlOrLocalFallback(
			env.mode,
			process.env.USER_CONTENT_URL,
			8789
		),
		'process.env.SVELTE_DRAW_ENV': JSON.stringify(process.env.SVELTE_DRAW_ENV ?? 'development'),
		// A monotonic build identifier (epoch ms at build time). Sent as `?v=` on sync websocket
		// connections so the server can tell how old a client bundle is — parked background tabs
		// keep running whatever bundle they loaded, potentially for weeks.
		'process.env.CLIENT_BUILD_TIMESTAMP': JSON.stringify(Date.now().toString()),
		'process.env.TLDRAW_LICENSE': JSON.stringify(process.env.TLDRAW_LICENSE ?? ''),
		// Fall back to staging DSN for local develeopment, although you still need to
		// modify the env check in 'sentry.client.config.ts' to get it reporting errors
		'process.env.SENTRY_DSN': JSON.stringify(
			process.env.SENTRY_DSN ??
				'https://4adc43773d07854d8a60e119505182cc@o578706.ingest.sentry.io/4506178821881856'
		),
	},
	// Workspace packages (assets, fonts, icons) are served straight from the monorepo.
	optimizeDeps: {
		exclude: ['@svelte-draw/assets'],
	},
	server: {
		fs: { allow: [path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')] },
		allowedHosts: process.env.VITE_ALLOWED_HOSTS?.split(',').filter(Boolean),
		proxy: {
			// OAuth protected resource metadata for the MCP server. Served by the sync worker but
			// addressed at this origin, because RFC 9728 puts it at the resource's own origin rather than
			// under its path — the deployed equivalent is the extra route in the worker's wrangler.toml.
			// Not rewritten: the worker matches this path as-is.
			'/.well-known/oauth-protected-resource': {
				target: multiplayerServerProxyTarget,
			},
			'/api': {
				target: multiplayerServerProxyTarget,
				rewrite: (path) => path.replace(/^\/api/, ''),
				ws: false, // we talk to the websocket directly via workers.dev
				// Useful for debugging proxy issues
				// configure: (proxy, _options) => {
				// 	proxy.on('error', (err, _req, _res) => {
				// 		console.log('[proxy] proxy error', err)
				// 	})
				// 	proxy.on('proxyReq', (proxyReq, req, _res) => {
				// 		console.log('[proxy] Sending Request to the Target:', req.method, req.url)
				// 	})
				// 	proxy.on('proxyRes', (proxyRes, req, _res) => {
				// 		console.log(
				// 			'[proxy] Received Response from the Target:',
				// 			proxyRes.statusCode,
				// 			req.url
				// 		)
				// 	})
				// },
			},
		},
		watch: {
			ignored: ['**/playwright-report/**', '**/test-results/**'],
		},
	},
	preview: {
		proxy: {
			// See the dev server proxy above.
			'/.well-known/oauth-protected-resource': {
				target: multiplayerServerProxyTarget,
			},
			'/api': {
				target: multiplayerServerProxyTarget,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
	},
	css: {
		modules: {
			scopeBehaviour: 'local',
			exportGlobals: true,
			localsConvention: 'camelCase',
		},
	},
}))
