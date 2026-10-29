<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'
	import { SHAPE_WIDTH_PX, ShapeSizes } from './ShapeSizes'

	let { id, contents }: { id: TLShapeId; contents: string[] } = $props()

	const editor = getEditor()

	// [4] (the measuring half of the shape; see the guide in DynamicSizeShapeUtil.ts)
	let ref = $state<HTMLDivElement | null>(null)

	function updateShapeSize() {
		if (!ref) return

		// [a] Get actual DOM dimensions
		const width = ref.offsetWidth
		const height = ref.offsetHeight

		// [b] Update the shape size in our global atom
		ShapeSizes.update(editor, (map) => {
			const existing = map.get(id)
			if (existing && existing.width === width && existing.height === height) return map
			return map.set(id, { width, height })
		})
	}

	let contentsToShow = $state('')

	// [c] Update size immediately on render (after every DOM update of the measured element)
	$effect(() => {
		void contentsToShow
		void id
		updateShapeSize()
	})

	// [d] Watch for DOM size changes using ResizeObserver
	$effect(() => {
		if (!ref) return
		const observer = new ResizeObserver(updateShapeSize)
		observer.observe(ref)
		return () => {
			observer.disconnect()
		}
	})

	// [i] Animate text content to demonstrate dynamic sizing
	$effect(() => {
		const words = contents
		const animationDuration = 6000
		let frame = 0
		const tick = (time: number) => {
			const progress = (time % animationDuration) / animationDuration
			const amountToShow = progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2

			contentsToShow = words.slice(0, Math.floor(amountToShow * words.length)).join(' ')

			frame = requestAnimationFrame(tick)
		}

		frame = requestAnimationFrame(tick)

		return () => {
			cancelAnimationFrame(frame)
		}
	})
</script>

<!-- [ii] Return DOM element that will be measured -->
<div bind:this={ref} style:width="{SHAPE_WIDTH_PX}px">
	{contentsToShow}
</div>
