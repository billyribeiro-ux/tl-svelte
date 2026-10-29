import { tlmenus } from '@svelte-draw/editor'
import { fromComputed } from '../state/fromSignal'

/**
 * Tracks whether a menu with the given id is open in the global `tlmenus` registry. Call during
 * component initialisation (it uses `$effect`). Replaces `useGlobalMenuIsOpen`.
 *
 * `id`, `onChange` and `onEvent` may be passed as getters to follow reactive props.
 *
 * @example
 * ```ts
 * const menu = useGlobalMenuIsOpen('my-menu')
 * // template: open={menu.isOpen} onOpenChange={menu.onOpenChange}
 * ```
 *
 * @public
 */
export function useGlobalMenuIsOpen(
	id: string | (() => string),
	onChange?: (isOpen: boolean) => void,
	onEvent?: (id: string) => void
): { readonly isOpen: boolean; onOpenChange(isOpen: boolean): void } {
	const getId = typeof id === 'function' ? id : () => id
	let isOpenNow = false

	const onOpenChange = (isOpen: boolean) => {
		isOpenNow = isOpen

		if (isOpen) {
			tlmenus.addOpenMenu(getId())
		} else {
			tlmenus.deleteOpenMenu(getId())
		}

		onChange?.(isOpen)
	}

	const isOpenSignal = $derived(
		fromComputed('is menu open', () => tlmenus.getOpenMenus().includes(getId()))
	)

	$effect(() => {
		const currentId = getId()
		// When the effect runs, if the menu is open then
		// add it to the open menus list.

		// This is necessary for cases where the user closes
		// the parent of a submenu before closing the submenu.
		// There is some duplication between this and `onOpenChange`
		// but it's necessary to handle the case where
		// this effect re-runs.
		if (isOpenNow) {
			onEvent?.('open-menu')
			tlmenus.addOpenMenu(currentId)
		}

		return () => {
			if (isOpenNow) {
				// Close menu on unmount
				tlmenus.deleteOpenMenu(currentId)

				// Close menu and all submenus when the parent is closed
				tlmenus.getOpenMenus().forEach((menuId) => {
					if (menuId.startsWith(currentId)) {
						onEvent?.('close-menu')
						tlmenus.deleteOpenMenu(menuId)
					}
				})

				isOpenNow = false
			}
		}
	})

	return {
		get isOpen() {
			return isOpenSignal.current
		},
		onOpenChange,
	}
}
