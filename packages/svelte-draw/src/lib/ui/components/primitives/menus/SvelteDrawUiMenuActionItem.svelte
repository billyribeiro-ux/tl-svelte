<script lang="ts" module>
	import type { TLUiMenuItemProps } from './SvelteDrawUiMenuItem.svelte'

	/** @public */
	export type TLUiMenuActionItemProps = {
		actionId?: string
		/** What to do when the item is disabled, by `disabled` or the action's `isEnabled`. Defaults to `'disable'`. */
		whenDisabled?: 'hide' | 'disable'
	} & Partial<Pick<TLUiMenuItemProps, 'disabled' | 'isSelected' | 'noClose' | 'onSelect'>>
</script>

<script lang="ts">
	import { getActions } from '../../../context'
	import { createActionState } from '../../../hooks'
	import { getSvelteDrawUiMenuContext } from './SvelteDrawUiMenuContext'
	import SvelteDrawUiMenuItem from './SvelteDrawUiMenuItem.svelte'

	let {
		actionId = '',
		whenDisabled = 'disable',
		disabled = false,
		...rest
	}: TLUiMenuActionItemProps = $props()

	const actions = getActions()
	const menu = getSvelteDrawUiMenuContext()
	const action = $derived(actions[actionId])
	const state = createActionState(() => action)

	const shouldRender = $derived.by(() => {
		if (!action) return false
		if (!state.current.available) {
			// The shortcuts dialog lists what a key does, even where the menu item wouldn't show.
			return menu.type === 'keyboard-shortcuts'
		}
		return !((disabled || !state.current.enabled) && whenDisabled === 'hide')
	})
</script>

{#if shouldRender}
	<SvelteDrawUiMenuItem
		{...action as TLUiMenuItemProps}
		{...rest}
		disabled={disabled || !state.current.enabled}
	/>
{/if}
