import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'

// Runs ./worker/worker.ts in workerd, without SvelteKit. The SvelteKit dev server proxies the
// worker's routes to this one (see vite.config.ts).
export default defineConfig({
	plugins: [cloudflare()],
	server: { port: 8787, strictPort: true },
})
