import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		sveltekit({
			// The editor is browser-only, so the client is a client-side SPA. The multiplayer
			// server in src/server is a separate Node process (`pnpm dev-server`).
			adapter: adapter({ fallback: 'index.html' }),
			// Compile your own components in runes mode. Libraries in node_modules keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	server: {
		port: 5757,
	},
	optimizeDeps: {
		exclude: ['@svelte-draw/assets'],
	},
})
