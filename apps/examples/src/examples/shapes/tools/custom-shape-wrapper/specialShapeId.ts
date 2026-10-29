import { atom, type TLShapeId } from 'svelte-draw'

// [1]
export const specialShapeId = atom<TLShapeId | null>('special shape id', null)
