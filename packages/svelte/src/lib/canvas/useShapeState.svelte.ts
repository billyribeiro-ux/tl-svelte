import type { TLInstancePresence, TLShapeId, TLUserId } from '@svelte-draw/editor'
import { uniq } from '@svelte-draw/editor'
import { computed } from '@svelte-draw/state'
import { areArraysShallowEqual } from '@svelte-draw/utils'
import { getEditor } from '../context/editor'
import { fromComputed, fromSignal } from '../state/fromSignal'

type MaybeGetter<T> = T | (() => T)
const read = <T>(v: MaybeGetter<T>): T => (typeof v === 'function' ? (v as () => T)() : v)

/**
 * Whether the given shape is being edited. Call during component initialisation; read `.current`.
 * Replaces `useIsEditing`. `shapeId` may be a getter to follow a reactive prop.
 *
 * @public
 */
export function useIsEditing(shapeId: MaybeGetter<TLShapeId>): { readonly current: boolean } {
	const editor = getEditor()
	const signal = $derived.by(() => {
		const id = read(shapeId)
		return fromComputed('isEditing', () => editor.getEditingShapeId() === id)
	})
	return {
		get current() {
			return signal.current
		},
	}
}

/**
 * Whether the given shape is being cropped. Replaces `useIsCropping`; see {@link useIsEditing}.
 *
 * @public
 */
export function useIsCropping(shapeId: MaybeGetter<TLShapeId>): { readonly current: boolean } {
	const editor = getEditor()
	const signal = $derived.by(() => {
		const id = read(shapeId)
		return fromComputed('isCropping', () => editor.getCroppingShapeId() === id)
	})
	return {
		get current() {
			return signal.current
		},
	}
}

/**
 * Reactive list of peer user IDs for collaborators currently shown in the UI.
 * This list includes user ids who are not on the user's current page.
 * Mirrors {@link Editor.getVisibleCollaborators} — peers fade out as they
 * transition to idle/inactive, without requiring a manual re-render.
 *
 * Replaces `usePeerIds`; call during component initialisation and read `.current`.
 *
 * @public
 */
export function usePeerIds() {
	const editor = getEditor()

	const userIds = fromSignal(
		computed('userIds', () => uniq(editor.getVisibleCollaborators().map((p) => p.userId)).sort(), {
			isEqual: areArraysShallowEqual,
		})
	)

	return {
		get current() {
			return userIds.current
		},
	}
}

// TODO: maybe move this to a computed property on the App class?
/**
 * The latest presence of the user matching userId (null when there is none). Replaces
 * `usePresence`; `userId` may be a getter to follow a reactive prop.
 *
 * @public
 */
export function usePresence(userId: MaybeGetter<TLUserId>): {
	readonly current: TLInstancePresence | null
} {
	const editor = getEditor()
	const signal = $derived.by(() => {
		const id = read(userId)
		return fromComputed(`latestPresence:${id}`, () => {
			return editor.getCollaborators().find((c) => c.userId === id)
		})
	})
	return {
		get current() {
			return signal.current ?? null
		},
	}
}
