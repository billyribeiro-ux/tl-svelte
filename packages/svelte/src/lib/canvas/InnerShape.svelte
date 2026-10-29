<script lang="ts">
	import type { ShapeUtil, TLShape } from '@svelte-draw/editor'
	import { fromComputed } from '../state/fromSignal'
	import View from './View.svelte'

	/**
	 * Renders the inside of a shape. Equivalent of the memoised `InnerShape`: it re-renders when
	 * `shape.props` / `shape.meta` change identity (`areShapesContentEqual`) or the util changes, and
	 * whenever a signal read by `util.component()` changes (the old `useStateTracking`).
	 */
	let { shape, util }: { shape: TLShape; util: ShapeUtil<any> } = $props()

	// Only these identities matter: a new `shape` object with the same props and meta is "equal".
	const shapeProps = $derived(shape.props)
	const shapeMeta = $derived(shape.meta)
	const shapeId = $derived(shape.id)
	const shapeType = $derived(shape.type)
	// Value-stable: `util` is read through the parent's reactive item, which is replaced on every change.
	const shapeUtil = $derived(util)

	// A fresh tracked computed whenever the memo inputs change.
	const rendered = $derived.by(() => {
		void shapeProps
		void shapeMeta
		const currentUtil = shapeUtil
		const id = shapeId
		return fromComputed(
			'InnerShape:' + shapeType,
			() =>
				// always fetch the latest shape from the store even if the props/meta have not changed, to avoid
				// calling the render method with stale data.
				currentUtil.component(currentUtil.editor.store.unsafeGetWithoutCapture(id) as TLShape)
		)
	})
</script>

<View view={rendered.current} />
