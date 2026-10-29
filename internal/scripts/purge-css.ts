import { PurgeCSS } from 'purgecss'
import { nicelog } from './lib/nicelog'

async function main() {
	const purgeCSSResults = await new PurgeCSS().purge({
		content: ['packages/svelte-draw/**/*.svelte', 'packages/editor/**/*.ts'],
		css: ['packages/svelte-draw/src/lib/ui.css'],
		rejected: true,
	})

	nicelog(purgeCSSResults)
}

main()
