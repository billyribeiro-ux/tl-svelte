import { clearLocalStorage, clearSessionStorage } from '@svelte-draw/utils'
import { deleteDB } from 'idb'
import { LocalIndexedDb, getAllIndexDbNames } from './LocalIndexedDb'

/**
 * Clear the database of all data associated with svelte-draw.
 *
 * @public */
export async function hardReset({ shouldReload = true } = {}) {
	clearSessionStorage()

	for (const instance of LocalIndexedDb.connectedInstances) {
		await instance.close()
	}
	await Promise.all(getAllIndexDbNames().map((db) => deleteDB(db)))

	clearLocalStorage()
	if (shouldReload) {
		window.location.reload()
	}
}
