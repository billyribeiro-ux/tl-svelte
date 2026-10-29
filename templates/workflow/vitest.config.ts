import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

// The tests run outside SvelteKit: they only need the Svelte compiler (node definitions import
// `.svelte` components), the same runes-mode rule as the app, and a DOM.
export default defineConfig({
	plugins: [
		svelte({
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	resolve: { conditions: ['browser'] },
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts'],
	},
})
