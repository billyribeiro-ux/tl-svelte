import { getContext, setContext } from 'svelte'

const SELECT_KEY = Symbol('svelte-draw.ui.select')

/** Lets `SvelteDrawUiSelectValue` know whether the select currently has a value (for its placeholder). */
export interface SelectContext {
	readonly value: string
}

export function setSelectContext(context: SelectContext): void {
	setContext(SELECT_KEY, context)
}

export function getSelectContext(): SelectContext | undefined {
	return getContext<SelectContext | undefined>(SELECT_KEY)
}
