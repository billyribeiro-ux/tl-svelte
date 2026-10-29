import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// The Cloudflare Worker in `worker/` serves `/api/*` (see wrangler.toml). `pnpm dev` runs it with
// `wrangler dev` next to the Vite dev server and Vite proxies `/api` to it, so the client calls the
// same relative URLs in development and in production.
const WORKER_ORIGIN = process.env.WORKER_ORIGIN ?? 'http://localhost:8787'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		// Browser-only SPA: the editor needs canvas, IndexedDB and friends, so nothing is prerendered.
		sveltekit({
			adapter: adapter({ fallback: 'index.html' }),
			// Every component here is written for runes. Without this, a component that happens not to
			// use a rune is compiled in legacy mode. Third-party libraries in node_modules keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	server: {
		// The workspace `svelte-draw` package serves its fonts and icons from packages/assets.
		fs: { allow: ['../..'] },
		proxy: { '/api': WORKER_ORIGIN },
	},
	optimizeDeps: {
		exclude: ['@svelte-draw/assets'],
	},
})
