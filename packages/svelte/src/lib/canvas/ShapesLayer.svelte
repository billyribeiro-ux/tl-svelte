<script lang="ts">
	import { debugFlags, tlenv, type TLShapeId } from '@svelte-draw/editor'
	import { getEditor } from '../context/editor'
	import { fromComputed } from '../state/fromSignal'
	import { quickReactor } from '../state/reactor'
	import { tryGetContentSlots } from './contentSlots'
	import DebugSvgCopy from './DebugSvgCopy.svelte'
	import Shape from './Shape.svelte'
	import { setShapeCulling } from './shapeCulling'

	let { canvas }: { canvas: HTMLDivElement | null } = $props()

	const editor = getEditor()
	const debugSvg = fromComputed('debug svg', () => debugFlags.debugSvg.get())
	const renderingShapes = fromComputed('rendering shapes', () => editor.getRenderingShapes())

	const culling = setShapeCulling()
	const contentSlots = tryGetContentSlots()

	// Release the content element slots of shapes that are leaving the rendering list *before* the
	// keyed each block below removes their DOM (this pre-effect is created before the template's
	// effects, so it runs first in the flush). See ContentElementSlot.svelte for why this is needed.
	let renderedIds = new Set<TLShapeId>()
	$effect.pre(() => {
		const next = new Set(renderingShapes.current.map((result) => result.id))
		for (const id of renderedIds) {
			if (!next.has(id)) contentSlots?.release(id)
		}
		renderedIds = next
	})

	/*
	 * Centralized culling controller that updates shape container visibility.
	 * This single reactor replaces per-shape subscriptions for O(1) instead of O(N) subscriptions.
	 */
	$effect(() =>
		quickReactor('update shape culling', () => {
			const culledShapes = editor.getCulledShapes()
			culling.updateCulling(culledShapes)
		})
	)

	// Safari only: reflow when the set of culled shapes changes.
	$effect(() => {
		if (!tlenv.isSafari) return
		const canvasEl = canvas
		let culledShapes: Set<TLShapeId> = new Set()
		return quickReactor('reflow for culled shapes', () => {
			const nextCulledShapes = editor.getCulledShapes()
			if (culledShapes === nextCulledShapes) return

			culledShapes = nextCulledShapes
			if (!canvasEl) return
			// This causes a reflow
			// https://gist.github.com/paulirish/5d52fb081b3570c81e3a
			const _height = canvasEl.offsetHeight
		})
	})
</script>

{#each renderingShapes.current as result (result.id)}
	<!-- Explicit props rather than `{...result}`: a spread makes every prop read depend on the whole
	     result object, which changes whenever any field does, re-running per-shape effects (and the
	     content element slot's adoption) on every z-order change. -->
	<Shape
		id={result.id}
		shape={result.shape}
		util={result.util}
		index={result.index}
		backgroundIndex={result.backgroundIndex}
		opacity={result.opacity}
	/>
	{#if debugSvg.current}
		<DebugSvgCopy id={result.id} mode="iframe" />
	{/if}
{/each}
