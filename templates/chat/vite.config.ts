import adapter from '@sveltejs/adapter-vercel'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		sveltekit({
			// The /api routes run on the server; the pages themselves are browser-only (see +layout.ts).
			// Swap the adapter if you deploy somewhere other than Vercel.
			adapter: adapter(),
			// Compile your own components in runes mode. Libraries in node_modules keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
})
