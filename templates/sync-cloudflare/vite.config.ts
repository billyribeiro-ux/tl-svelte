import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		sveltekit({
			// The client is a browser-only SPA, built to ./build and served by the worker as static
			// assets (see wrangler.toml).
			adapter: adapter({ fallback: 'index.html' }),
			// Compile your own components in runes mode. Libraries in node_modules keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	server: {
		// In development the worker runs in its own vite server (`pnpm dev-worker`); `/api` is
		// forwarded to it, including the websocket that syncs each room.
		proxy: { '/api': { target: 'http://localhost:8787', ws: true } },
	},
})
