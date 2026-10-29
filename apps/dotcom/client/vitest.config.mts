import { sveltekit } from '@sveltejs/kit/vite'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
	// The SvelteKit plugin (without an adapter) provides `$app/*`, `./$types` and the `#lib` alias
	// the same way the app build does, and compiles `.svelte` / `.svelte.ts` in runes mode.
	plugins: [
		sveltekit({
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
			files: { assets: 'public' },
		}),
	],
	// Svelte's `mount()` and `$app/state` need the browser build of svelte, not the server one.
	resolve: { conditions: ['browser'] },
	test: {
		fsModuleCache: true,
		pool: 'threads',
		environment: 'jsdom',
		setupFiles: ['./setupTests.js'],
		globals: true,
		testTimeout: 30000,
		include: ['**/*.{test,spec}.{js,ts}'],
		// Extend the defaults rather than replace them: dropping `**/node_modules/**` runs the tests
		// of every workspace package linked into this app's node_modules (pnpm's linker does that).
		exclude: [...configDefaults.exclude, '**/e2e/**', '**/.svelte-kit/**'],
	},
	ssr: {
		noExternal: [],
	},
})
