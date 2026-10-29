<script lang="ts">
	import { react } from '@svelte-draw/state'
	import type { Box, TLShapeId } from '@svelte-draw/editor'
	import { getEditor } from '../context/editor'
	import { fromComputed } from '../state/fromSignal'

	let { id, mode }: { id: TLShapeId; mode: 'img' | 'iframe' } = $props()

	const editor = getEditor()

	let image = $state.raw<{ src: string; bounds: Box } | null>(null)

	const isInRootSignal = $derived.by(() => {
		const shapeId = id
		return fromComputed('is in root', () => {
			const shape = editor.getShape(shapeId)
			return shape?.parentId === editor.getCurrentPageId()
		})
	})
	const isInRoot = $derived(isInRootSignal.current)

	$effect(() => {
		const shapeId = id
		if (!isInRoot) return

		let latest: number | null = null
		const unsubscribe = react('shape to svg', async () => {
			const renderId = Math.random()
			latest = renderId

			const shape = editor.getShape(shapeId)
			const isSingleFrame = !!shape && editor.isShapeFrameLike(shape)
			const padding = isSingleFrame ? 0 : 10
			let bounds = editor.getShapePageBounds(shapeId)
			if (!bounds) return
			bounds = bounds.clone().expandBy(padding)

			const result = await editor.getSvgString([shapeId], { padding })

			if (latest !== renderId || !result) return

			const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(result.svg)}`
			image = { src: svgDataUrl, bounds }
		})

		return () => {
			latest = null
			unsubscribe()
		}
	})
</script>

{#if isInRoot && image}
	{#if mode === 'iframe'}
		<iframe
			title="Debug SVG copy"
			src={image.src}
			width={image.bounds.width}
			height={image.bounds.height}
			referrerpolicy="no-referrer"
			style:position="absolute"
			style:top="0"
			style:left="0"
			style:border="none"
			style:transform={`translate(${image.bounds.x}px, ${image.bounds.maxY + 12}px)`}
			style:outline="1px solid black"
			style:max-width="none"
		></iframe>
	{:else}
		<img
			alt=""
			src={image.src}
			width={image.bounds.width}
			height={image.bounds.height}
			referrerpolicy="no-referrer"
			style:position="absolute"
			style:top="0"
			style:left="0"
			style:transform={`translate(${image.bounds.x}px, ${image.bounds.maxY + 12}px)`}
			style:outline="1px solid black"
			style:max-width="none"
		/>
	{/if}
{/if}
