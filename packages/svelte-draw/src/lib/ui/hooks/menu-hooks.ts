import { fromComputed, getEditor, type SignalValue } from '@svelte-draw/svelte'
import {
	canApplySelectionAction,
	getUnlockedSelectedShapes,
	hasShapesOnPage,
} from '../context/action-predicates'

// The @public helpers here are SDK API: keep them even when nothing in svelte-draw calls them.
// They replace the `use*` hooks of the same names (see the table in ./index.ts). `min` / `max` may
// be getters to follow reactive props.

type MaybeGetter<T> = T | (() => T)
const read = <T>(v: MaybeGetter<T>): T => (typeof v === 'function' ? (v as () => T)() : v)

function countWithinBounds(len: number, min?: number, max?: number) {
	if (min === undefined && max === undefined) return len
	return (min === undefined || len >= min) && (max === undefined || len <= max)
}

/**
 * True if the number of LOCKED OR UNLOCKED selected shapes is at least min or at most max (the
 * count itself when neither is given). Replaces `useAnySelectedShapesCount`.
 */
export function createAnySelectedShapesCount(
	min?: MaybeGetter<number | undefined>,
	max?: MaybeGetter<number | undefined>
): SignalValue<number | boolean> {
	const editor = getEditor()
	return fromComputed('selectedShapes', () =>
		countWithinBounds(editor.getSelectedShapes().length, read(min), read(max))
	)
}

/**
 * True if the number of UNLOCKED selected shapes is at least min or at most max. Replaces
 * `useUnlockedSelectedShapesCount`.
 * @public
 */
export function createUnlockedSelectedShapesCount(
	min?: MaybeGetter<number | undefined>,
	max?: MaybeGetter<number | undefined>
): SignalValue<number | boolean> {
	const editor = getEditor()
	return fromComputed('selectedShapes', () =>
		countWithinBounds(getUnlockedSelectedShapes(editor).length, read(min), read(max))
	)
}

/** @public Replaces `useCanRedo`. */
export function createCanRedo(): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputed('useCanRedo', () => editor.getCanRedo())
}

/** @public Replaces `useCanUndo`. */
export function createCanUndo(): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputed('useCanUndo', () => editor.getCanUndo())
}

/** True if the current page has at least one shape. Replaces `useHasShapesOnPage`. */
export function createHasShapesOnPage(): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputed('hasShapesOnPage', () => hasShapesOnPage(editor))
}

/**
 * True if the user is in the select tool and has at least one shape selected. Replaces
 * `useCanApplySelectionAction`.
 * @public
 */
export function createCanApplySelectionAction(): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputed('canApplySelectionAction', () => canApplySelectionAction(editor))
}
