/// <reference types="vitest" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { mergeConfig } from 'vitest/config'
import baseConfig from '../../internal/config/vitest/node-preset'

export default mergeConfig(baseConfig, {
	plugins: [
		svelte({
			// Same as the apps: first-party components are always compiled in runes mode.
			dynamicCompileOptions({ filename }: { filename: string }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	resolve: { conditions: ['browser'] },
})
