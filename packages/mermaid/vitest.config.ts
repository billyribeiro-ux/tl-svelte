import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

// `svelte-draw` ships `.svelte` / `.svelte.ts` modules; `browser` makes `svelte` resolve to its
// client build so they load under jsdom.
export default defineConfig({
	plugins: [
		svelte({
			// Same as the apps: first-party components are always compiled in runes mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	resolve: { conditions: ['browser'] },
	test: {
		fsModuleCache: true,
		pool: 'threads',
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
	},
})
