import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
	plugins: [
		svelte({
			// Every first-party component is written for runes. Third-party libraries in node_modules
			// keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
		viteSingleFile(),
	],
	root: 'src/widget',
	envDir: '../..',
	build: {
		outDir: '../../dist',
		emptyOutDir: false,
	},
})
