import type { Atom } from 'svelte-draw'

/** The context key under which the example's private-mode atom is provided. */
export const PRIVATE_MODE_KEY = Symbol('private-mode')

export type PrivateModeAtom = Atom<boolean>
