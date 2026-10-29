import { fileURLToPath } from 'url'
import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { zodLocalePlugin } from './scripts/vite-zod-locale-plugin.js'

// The Cloudflare Worker (worker/) is NOT part of this Vite pipeline: @cloudflare/vite-plugin cannot
// run alongside the SvelteKit plugin (the worker entry fails to load in dev). It runs under
// `wrangler dev` instead, on WORKER_PORT, and the dev server proxies the client's `/stream` call to it.
const WORKER_PORT = Number(process.env.WORKER_PORT ?? 8787)

// https://vitejs.dev/config/
export default defineConfig(() => {
	return {
		plugins: [
			zodLocalePlugin(fileURLToPath(new URL('./scripts/zod-locales-shim.js', import.meta.url))),
			// Browser-only SPA (see src/routes/+layout.ts): the editor needs canvas and ResizeObserver.
			sveltekit({
				adapter: adapter({ fallback: 'index.html' }),
				// Every first-party component is written for runes. Without this, a component that happens
				// not to use a rune is compiled in legacy mode. Third-party libraries keep their own mode.
				dynamicCompileOptions({ filename }) {
					if (!filename.includes('node_modules')) return { runes: true }
					return undefined
				},
			}),
		],
		server: {
			proxy: { '/stream': `http://localhost:${WORKER_PORT}` },
		},
		preview: {
			proxy: { '/stream': `http://localhost:${WORKER_PORT}` },
		},
	}
})
