import type { TLShapeId } from '@svelte-draw/editor'
import { getContext, setContext } from 'svelte'

/**
 * Tracks the live content element slots so they can be released while still connected.
 *
 * Svelte removes a destroyed block's DOM before it runs teardowns of the effects inside it (see
 * `destroy_effect` in svelte's `reactivity/effects.js`), so a slot's attachment teardown can no
 * longer guarantee that the slot is still connected. The owner of the DOM update (`ShapesLayer`,
 * and the canvas root's global out-transition) calls {@link ContentSlots.release} /
 * {@link ContentSlots.releaseAll} just before the slots are removed instead. Releasing is
 * idempotent, so the teardown stays as a fallback.
 *
 * @internal
 */
export class ContentSlots {
	private readonly releases = new Map<TLShapeId, () => void>()

	register(id: TLShapeId, release: () => void) {
		this.releases.set(id, release)
	}

	unregister(id: TLShapeId, release: () => void) {
		if (this.releases.get(id) === release) this.releases.delete(id)
	}

	release(id: TLShapeId) {
		this.releases.get(id)?.()
	}

	releaseAll() {
		for (const release of [...this.releases.values()]) release()
	}
}

const SLOTS_KEY = Symbol('svelte-draw.content-slots')

/** Provides a {@link ContentSlots} registry to descendants. Call during `ShapesLayer` initialisation. */
export function setContentSlots(): ContentSlots {
	const slots = new ContentSlots()
	setContext(SLOTS_KEY, slots)
	return slots
}

/** The registry, or null when the slot is rendered outside of a `ShapesLayer`. */
export function tryGetContentSlots(): ContentSlots | null {
	return getContext<ContentSlots | undefined>(SLOTS_KEY) ?? null
}
