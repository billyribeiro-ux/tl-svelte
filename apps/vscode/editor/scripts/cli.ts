import path from 'path'

const displayRelative = (from: string, to: string) => {
	const outpath = path.relative(from, to)
	if (!outpath.match(/^\./)) {
		return `./${outpath}`
	}
	return outpath
}

type LogDef =
	| { cmd: 'remove'; env: string; args: { target: string } }
	| { cmd: 'copy'; env: string; args: { source: string; dest: string } }
	| { cmd: 'vite'; env: string; args: { entryPoints: string[] } }
	| { cmd: 'vite:success'; env: string; args: any }
	| { cmd: 'vite:error'; env: string; args: { error: unknown } }

export function log(def: LogDef) {
	const printStderr = (icon: string, cmd: string, ...args: unknown[]) => {
		console.error(`${icon} [${def.env ?? 'unknown'}/${cmd}]`, ...args)
	}

	if (def.cmd === 'remove') {
		const { target } = def.args
		printStderr('🗑 ', 'remove', displayRelative(process.cwd(), target))
	} else if (def.cmd === 'copy') {
		const { source, dest } = def.args
		printStderr(
			'🏠',
			'copy',
			`${displayRelative(process.cwd(), source)} -> ${displayRelative(process.cwd(), dest)}`
		)
	} else if (def.cmd === 'vite') {
		printStderr(
			'🤖',
			'vite',
			`${def.args.entryPoints.map((pathname) => displayRelative(process.cwd(), pathname))}`
		)
	} else if (def.cmd === 'vite:success') {
		printStderr('✅', `vite`, `build successful (${new Date().toISOString()})`)
	} else if (def.cmd === 'vite:error') {
		printStderr(`❌`, `vite`, `error`)
		console.error(def.args.error)
	} else {
		// @ts-ignore
		printStderr(`❓`, def.cmd, JSON.stringify(def.args))
	}
}

export function logEnv(env: string) {
	return (opts: any) => {
		log({ ...opts, env })
	}
}
