// Starts the Cloudflare Worker (wrangler dev) and the SvelteKit dev server together, so `pnpm dev`
// keeps doing what it did before the SvelteKit port: one command, working chat.
import { spawn } from 'node:child_process'

const workerPort = process.env.WORKER_PORT ?? '8787'
const extraViteArgs = process.argv.slice(2)

const children = [
	spawn('pnpm', ['exec', 'wrangler', 'dev', '--port', workerPort, '--assets', './static'], {
		stdio: 'inherit',
		env: process.env,
	}),
	spawn('pnpm', ['exec', 'vite', 'dev', '--host', ...extraViteArgs], {
		stdio: 'inherit',
		env: { ...process.env, WORKER_PORT: workerPort },
	}),
]

let exiting = false
function shutdown(code) {
	if (exiting) return
	exiting = true
	for (const child of children) child.kill('SIGTERM')
	process.exit(code)
}

for (const child of children) {
	child.on('exit', (code) => shutdown(code ?? 0))
}
process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
