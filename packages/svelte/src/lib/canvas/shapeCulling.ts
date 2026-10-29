import type { TLShapeId } from '@svelte-draw/editor'
import { getContext, setContext } from 'svelte'
import { setStyleProperty } from './utils'

interface ShapeContainerEntry {
	container: HTMLDivElement
	bgContainer: HTMLDivElement | null
	isCulled: boolean
}

/**
 * Centralized culling management for shape containers. This allows a single reactor to update all
 * shape display states instead of each shape having its own subscription.
 *
 * @internal
 */
export class ShapeCulling {
	private readonly containers = new Map<TLShapeId, ShapeContainerEntry>()

	register(
		id: TLShapeId,
		container: HTMLDivElement,
		bgContainer: HTMLDivElement | null,
		isCulled: boolean
	) {
		const display = isCulled ? 'none' : 'block'
		setStyleProperty(container, 'display', display)
		setStyleProperty(bgContainer, 'display', display)

		this.containers.set(id, { container, bgContainer, isCulled })
	}

	unregister(id: TLShapeId) {
		this.containers.delete(id)
	}

	updateCulling(culledShapes: Set<TLShapeId>) {
		let shouldBeCulled: boolean

		for (const [id, entry] of this.containers) {
			shouldBeCulled = culledShapes.has(id)
			if (shouldBeCulled !== entry.isCulled) {
				const display = shouldBeCulled ? 'none' : 'block'
				setStyleProperty(entry.container, 'display', display)
				setStyleProperty(entry.bgContainer, 'display', display)
				entry.isCulled = shouldBeCulled
			}
		}
	}
}

const CULLING_KEY = Symbol('svelte-draw.shape-culling')

/** Replacement for `ShapeCullingProvider`: provides a fresh {@link ShapeCulling} to descendants. */
export function setShapeCulling(): ShapeCulling {
	const culling = new ShapeCulling()
	setContext(CULLING_KEY, culling)
	return culling
}

/** Replacement for `useShapeCulling`. Throws outside of a `setShapeCulling` tree. */
export function getShapeCulling(): ShapeCulling {
	const culling = getContext<ShapeCulling | undefined>(CULLING_KEY)
	if (!culling) throw new Error('getShapeCulling must be used within setShapeCulling')
	return culling
}
