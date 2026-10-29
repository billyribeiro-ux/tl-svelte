<script lang="ts" module>
	import type { TLUiMenuCheckboxItemProps } from './SvelteDrawUiMenuCheckboxItem.svelte'

	/** @public */
	export type TLUiMenuActionCheckboxItemProps = {
		actionId?: string
		/** What to do when the item is disabled, by `disabled` or the action's `isEnabled`. Defaults to `'disable'`. */
		whenDisabled?: 'hide' | 'disable'
	} & Pick<TLUiMenuCheckboxItemProps, 'disabled' | 'checked' | 'toggle'>
</script>

<script lang="ts">
	import { getActions } from '../../../context'
	import { createActionState } from '../../../hooks'
	import SvelteDrawUiMenuCheckboxItem from './SvelteDrawUiMenuCheckboxItem.svelte'

	let {
		actionId = '',
		whenDisabled = 'disable',
		disabled = false,
		checked,
		...rest
	}: TLUiMenuActionCheckboxItemProps = $props()

	const actions = getActions()
	const action = $derived(actions[actionId])
	const state = createActionState(() => action)

	const shouldRender = $derived(
		!!action &&
			state.current.available &&
			!((disabled || !state.current.enabled) && whenDisabled === 'hide')
	)
</script>

{#if shouldRender}
	<SvelteDrawUiMenuCheckboxItem
		{...action as TLUiMenuCheckboxItemProps}
		{...rest}
		checked={checked ?? state.current.checked ?? false}
		disabled={disabled || !state.current.enabled}
	/>
{/if}
