/// <reference types="vitest" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { mergeConfig } from 'vitest/config'
import baseConfig from '../../internal/config/vitest/node-preset'

// sync-core package needs custom WebSocket resolution and enhanced jsdom setup
export default mergeConfig(baseConfig, {
	// The test fixtures import the SDK entry point, which contains .svelte files.
	plugins: [
		svelte({
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	test: {
		setupFiles: ['../../internal/config/vitest/setup.ts', './setupVitest.js'],
	},
})
