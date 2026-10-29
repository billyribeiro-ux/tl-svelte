import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		sveltekit({
			// The editor is browser-only, so this is a client-side SPA served from `index.html`.
			adapter: adapter({ fallback: 'index.html' }),
			// Compile your own components in runes mode. Libraries in node_modules keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
})
