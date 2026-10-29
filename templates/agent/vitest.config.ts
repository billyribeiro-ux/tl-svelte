import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts on purpose: that one loads the Cloudflare plugin and SvelteKit,
// neither of which belongs in a unit-test run.
export default defineConfig({
	plugins: [
		svelte({
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
				return undefined
			},
		}),
	],
	resolve: { conditions: ['browser'] },
	test: {
		environment: 'jsdom',
		include: ['client/**/*.test.ts', 'shared/**/*.test.ts', 'worker/**/*.test.ts'],
	},
})
