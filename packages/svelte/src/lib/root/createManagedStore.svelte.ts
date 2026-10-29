import {
	createTLSchemaFromUtils,
	createTLStore,
	type TLStoreOptions,
	type TLStoreSchemaOptions,
} from '@svelte-draw/editor'
import { areObjectsShallowEqual } from '@svelte-draw/utils'
import { stableValue } from './identity.svelte'

/**
 * Creates a `TLStore` from `getOptions()` and recreates it only when the options change shallowly.
 * Replaces the `useTLStore` hook. Call during component initialisation.
 *
 * @public
 */
export function createManagedTLStore(getOptions: () => TLStoreOptions) {
	const options = stableValue(getOptions, areObjectsShallowEqual)
	const store = $derived.by(() => createTLStore(options.current))
	return {
		get current() {
			return store
		},
	}
}

/**
 * Creates a schema from `getOptions()` and recreates it only when the options change shallowly.
 * Replaces the `useTLSchemaFromUtils` hook. Call during component initialisation.
 *
 * @public
 */
export function createManagedTLSchemaFromUtils(getOptions: () => TLStoreSchemaOptions) {
	const options = stableValue(getOptions, areObjectsShallowEqual)
	const schema = $derived.by(() => createTLSchemaFromUtils(options.current))
	return {
		get current() {
			return schema
		},
	}
}
