import { spawn } from 'child_process'
import dotenv from 'dotenv'
import { logEnv } from './cli'
import { getDirname } from './path'

dotenv.config()
const rootDir = getDirname(import.meta.url, '../')
const log = logEnv('editor')

export function run() {
	log({ cmd: 'vite', args: { entryPoints: [`${rootDir}src/index.ts`] } })

	// Rebuild on change; vite.config.ts copies dist/ into the extension after every bundle when
	// SVELTE_DRAW_COPY_TO_EXTENSION is set.
	const child = spawn('pnpm', ['exec', 'vite', 'build', '--watch', '--mode', 'development'], {
		cwd: rootDir,
		stdio: 'inherit',
		env: { ...process.env, SVELTE_DRAW_COPY_TO_EXTENSION: '1' },
	})
	child.on('exit', (code) => {
		if (code) log({ cmd: 'vite:error', args: { error: new Error(`vite exited with ${code}`) } })
		process.exit(code ?? 0)
	})
}

run()
