import { getContext, setContext } from 'svelte'

const MODAL_KEY = Symbol('svelte-draw.ui.dropdown-menu.modal')
const CHECKED_KEY = Symbol('svelte-draw.ui.dropdown-menu.item-checked')

/** `modal` of the nearest `SvelteDrawUiDropdownMenuRoot` (bits-ui has no `modal` prop on its Root). */
export function setDropdownMenuModal(getModal: () => boolean): void {
	setContext(MODAL_KEY, getModal)
}

export function getDropdownMenuModal(): boolean {
	return getContext<(() => boolean) | undefined>(MODAL_KEY)?.() ?? false
}

/** Lets `SvelteDrawUiDropdownMenuIndicator` know if its checkbox item is checked. */
export function setDropdownMenuItemChecked(getChecked: () => boolean): void {
	setContext(CHECKED_KEY, getChecked)
}

export function getDropdownMenuItemChecked(): () => boolean {
	const getChecked = getContext<(() => boolean) | undefined>(CHECKED_KEY)
	if (!getChecked) {
		throw new Error('SvelteDrawUiDropdownMenuIndicator must be used within a checkbox item')
	}
	return getChecked
}
