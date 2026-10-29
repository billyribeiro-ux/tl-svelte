import type { Component } from 'svelte'
import { getContext, setContext } from 'svelte'

const KEY = Symbol('svelte-draw.custom-in-front-of-the-canvas')

/** @internal */
export interface CustomInFrontOfTheCanvasHolder {
	readonly current: Component | null | undefined
}

/** Provided by `SvelteDraw`; read by the combined in-front-of-the-canvas layer. @internal */
export function setCustomInFrontOfTheCanvas(holder: CustomInFrontOfTheCanvasHolder): void {
	setContext(KEY, holder)
}

/** @internal */
export function getCustomInFrontOfTheCanvas(): CustomInFrontOfTheCanvasHolder {
	const holder = getContext<CustomInFrontOfTheCanvasHolder | undefined>(KEY)
	if (!holder) {
		throw new Error(
			'getCustomInFrontOfTheCanvas must be used inside of the <SvelteDraw /> component'
		)
	}
	return holder
}
