import type { TLShape } from 'svelte-draw'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		'validated-shape': {
			w: number
			h: number
			percentage: number
			rating: number
		}
	}
}

export type ValidatedShape = TLShape<'validated-shape'>
