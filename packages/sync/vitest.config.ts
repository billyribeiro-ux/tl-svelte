/// <reference types="vitest" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { mergeConfig } from 'vitest/config'
import baseConfig from '../../internal/config/vitest/node-preset'

// `.svelte.ts` modules need the Svelte compiler for runes; `browser` makes `svelte` resolve to its
// client build so effects run under jsdom.
export default mergeConfig(baseConfig, {
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
		setupFiles: ['../../internal/config/vitest/setup.ts', './setupVitest.js'],
	},
})
