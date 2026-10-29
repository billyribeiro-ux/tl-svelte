import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		// Browser-only SPA: the editor needs canvas, ResizeObserver and friends, so nothing is prerendered.
		sveltekit({
			adapter: adapter({ fallback: 'index.html' }),
			// Every first-party component is written for runes. Without this, a component that happens
			// not to use a rune is compiled in legacy mode, where mutating a top-level variable makes it
			// reactive. Third-party libraries in node_modules keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	optimizeDeps: {
		exclude: ['@svelte-draw/assets'],
	},
})
