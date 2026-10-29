<script lang="ts">
	import type { Snippet } from 'svelte'
	import { EditorPortal, usePassThroughWheelEvents } from 'svelte-draw'
	import { createIsMobileCommenting, createMobilePlacement } from './mobile-placement.svelte'

	/** The open thread's popover container, portaled above the UI panels. A wheel over it passes
	 *  through to the canvas (unless it scrolls its own content), like svelte-draw's panels. */
	let { base, children }: { base: { x: number; y: number }; children: Snippet } = $props()

	let element = $state.raw<HTMLDivElement | null>(null)
	const passThroughWheelEvents = usePassThroughWheelEvents()
	// On mobile the popover slides off its fixed offset to stay above the software keyboard and
	// on-screen; desktop keeps the fixed offset (base returned unchanged).
	const isMobile = createIsMobileCommenting()
	const placed = createMobilePlacement(
		() => element,
		() => base,
		() => isMobile.current
	)

	const stop = (e: Event) => e.stopPropagation()
</script>

<EditorPortal>
	<!-- contextmenu also stops here, so it can't reach the canvas's context-menu trigger and open the
	     canvas menu over this panel. The pointer handlers stay delegated to the app root, so they
	     run after the editor container's own native listeners — the order React's synthetic events
	     gave the original. -->
	<div
		bind:this={element}
		class="tlui-cmt-canvas-popover"
		style:left="{placed.left}px"
		style:top="{placed.top}px"
		role="presentation"
		onpointerdown={stop}
		oncontextmenu={stop}
		{@attach passThroughWheelEvents}
	>
		{@render children()}
	</div>
</EditorPortal>
