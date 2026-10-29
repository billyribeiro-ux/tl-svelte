import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		// Browser-only SPA: the editor needs canvas, WebGL and local storage, so nothing is prerendered.
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
	},
	optimizeDeps: {
		exclude: ['@svelte-draw/assets'],
	},
})
