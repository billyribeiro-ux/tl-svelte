import { tlenvReactive } from 'svelte-draw'

export function getIsCoarsePointer() {
	return tlenvReactive.get().isCoarsePointer
}
