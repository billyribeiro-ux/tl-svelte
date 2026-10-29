import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, type Plugin } from 'vite'
import { logEnv } from './scripts/cli'
import { copyEditor } from './scripts/helpers'

// The webview is a plain bundle, not a SvelteKit app: the extension host writes the HTML itself
// (apps/vscode/extension/src/SvelteDrawWebviewManager.ts) and loads `${assetSrc}/index.js` as a
// classic <script> plus `${assetSrc}/index.css`. So the build is a single IIFE with those exact names.
// `pnpm dev` (scripts/dev.ts) sets this so every rebuilt bundle is copied into the extension.
const copyToExtensionPlugin = (): Plugin => ({
	name: 'copy-editor-to-extension',
	apply: 'build',
	async closeBundle() {
		await copyEditor({ log: logEnv('editor') })
	},
})

export default defineConfig(({ mode }) => ({
	plugins: [
		process.env.SVELTE_DRAW_COPY_TO_EXTENSION ? copyToExtensionPlugin() : null,
		svelte({
			// Every first-party component is written for runes. Third-party libraries in node_modules
			// keep their own mode.
			dynamicCompileOptions({ filename }) {
				if (!filename.includes('node_modules')) return { runes: true }
			},
		}),
	],
	// `public/index.css` is imported by the app, so it is bundled into dist/index.css.
	publicDir: false,
	// Fonts and SVGs from @svelte-draw/assets are resolved by `getAssetUrlsByImport` at runtime.
	optimizeDeps: { exclude: ['@svelte-draw/assets'] },
	define: {
		'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		minify: false,
		target: 'es2022',
		// Inline fonts like the esbuild `dataurl` loader did; keep svg/png as files.
		assetsInlineLimit: (file) => /\.woff2?$/.test(file),
		cssCodeSplit: false,
		lib: {
			entry: 'src/index.ts',
			formats: ['iife'],
			name: 'SvelteDrawVscodeEditor',
			fileName: () => 'index.js',
			cssFileName: 'index',
		},
	},
}))
