import { computed } from '@svelte-draw/state'
import { fromSignal, tryGetEditor, type SignalValue } from '@svelte-draw/svelte'
import { getActionState, getActions, type TLUiActionItem, type TLUiActionState } from '../context'

function isSameState(a: TLUiActionState, b: TLUiActionState) {
	return a.available === b.available && a.enabled === b.enabled && a.checked === b.checked
}

/**
 * The one place menus read an action's visibility, enablement and checked state from. `action` is a
 * getter so it can follow a reactive prop. Call during component initialisation. Replaces
 * `useActionState`.
 *
 * @internal
 */
export function createActionState(
	action: () => TLUiActionItem | undefined
): SignalValue<TLUiActionState> {
	const editor = tryGetEditor()
	// `action` is read in the `$derived` body (not inside the signal) so that a changed prop swaps
	// the computed signal; the computed itself only tracks editor signals.
	const state = $derived.by(() => {
		const current = action()
		return fromSignal(
			computed('action state', () => getActionState(editor, current), { isEqual: isSameState })
		)
	})
	return {
		get current() {
			return state.current
		},
	}
}

function createSomeActions(
	name: string,
	actionIds: () => readonly string[],
	test: (state: TLUiActionState) => boolean
): SignalValue<boolean> {
	const editor = tryGetEditor()
	const actions = getActions()
	const flag = $derived.by(() => {
		// The actions are resolved here, in the `$derived` body, because `actions` is a live view of
		// a Svelte-reactive map; the computed below only tracks editor signals.
		const items = actionIds().map((id) => actions[id])
		return fromSignal(
			computed(name, () => items.some((item) => test(getActionState(editor, item))))
		)
	})
	return {
		get current() {
			return flag.current
		},
	}
}

/**
 * Whether any of the given actions is available and enabled. Unknown ids, unavailable actions,
 * and actions that aren't `readonlyOk` while the editor is readonly count as not enabled. Use it to
 * hide a submenu when none of its items can run; a closed submenu doesn't mount its items, so it
 * can't ask them. Replaces `useSomeActionsEnabled`.
 *
 * @public
 */
export function createSomeActionsEnabled(actionIds: () => readonly string[]): SignalValue<boolean> {
	return createSomeActions('some actions enabled', actionIds, (state) => state.enabled)
}

/**
 * Like {@link createSomeActionsEnabled}, but for a submenu that shows disabled items: true when any
 * of the actions would show at all. Replaces `useSomeActionsAvailable`.
 *
 * @internal
 */
export function createSomeActionsAvailable(
	actionIds: () => readonly string[]
): SignalValue<boolean> {
	return createSomeActions('some actions available', actionIds, (state) => state.available)
}
