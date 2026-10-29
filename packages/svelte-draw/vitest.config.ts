/// <reference types="vitest" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { mergeConfig } from 'vitest/config'
import baseConfig from '../../internal/config/vitest/node-preset'

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
		// Configure jsdom URL to match what deep link tests expect
		environmentOptions: {
			jsdom: {
				url: 'http://localhost/test',
			},
		},
		setupFiles: ['../../internal/config/vitest/setup.ts', './setupVitest.js'],
		// Global fake timers like Jest configuration
		fakeTimers: {
			toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
		},
		// CSS module mocking (equivalent to identity-obj-proxy)
		css: {
			modules: {
				classNameStrategy: 'non-scoped',
			},
		},
		// Test path ignore patterns
		exclude: [
			'**/*.css',
			'**/node_modules/**',
			'**/dist/**',
			'**/.tsbuild/**',
			'**/.tsbuild-dev/**',
			'**/.tsbuild-pub/**',
		],
		// Module name mapping for CSS and path aliases
		alias: {
			'^~(.*)$': './src/$1',
		},
	},
	// CSS and asset handling
	css: {
		modules: {
			// This provides similar functionality to identity-obj-proxy
			// CSS class names will be returned as-is for testing
			generateScopedName: (name) => name,
		},
	},
})
