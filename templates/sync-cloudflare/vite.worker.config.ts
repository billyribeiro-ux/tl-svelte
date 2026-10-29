import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'

// Runs ./worker/worker.ts (and the sync durable object) in workerd, without SvelteKit. The
// SvelteKit dev server proxies `/api` to this one (see vite.config.ts).
export default defineConfig({
	plugins: [cloudflare()],
	server: { port: 8787, strictPort: true },
})
