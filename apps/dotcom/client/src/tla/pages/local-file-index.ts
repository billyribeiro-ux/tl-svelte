import { compact } from 'svelte-draw'

export const STORE_PREFIX = 'SVELTE_DRAW_DOCUMENT_v2'

/** The route's `load`: the persistence keys of every local file stored in this browser's IndexedDB. */
export async function getAllPersistenceKeys() {
	return compact(await indexedDB.databases().then((d) => d.map(({ name }) => name)))
		.filter((name) => name.startsWith(STORE_PREFIX))
		.map((name) => name.slice(STORE_PREFIX.length))
		.sort()
}
