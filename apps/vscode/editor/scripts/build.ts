import { execFileSync } from 'child_process'
import { logEnv } from './cli'
import { getDirname } from './path'

const rootDir = getDirname(import.meta.url, '../')
const log = logEnv('editor')

export function build() {
	try {
		log({ cmd: 'vite', args: { entryPoints: [`${rootDir}src/index.ts`] } })
		// Run the CLI rather than vite's JS API: the JS API under `tsx` hands `.svelte.ts` modules to
		// the Svelte compiler before TypeScript is stripped. `emptyOutDir` in vite.config.ts clears dist/.
		execFileSync('pnpm', ['exec', 'vite', 'build', '--mode', 'production'], {
			cwd: rootDir,
			stdio: 'inherit',
		})
		log({ cmd: 'vite:success', args: {} })
	} catch (error) {
		log({ cmd: 'vite:error', args: { error } })
		throw error
	}
}

build()
