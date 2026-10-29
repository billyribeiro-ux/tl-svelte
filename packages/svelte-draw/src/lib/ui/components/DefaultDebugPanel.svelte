<script lang="ts">
	import { debugFlags } from '@svelte-draw/editor'
	import { fromComputed, getEditor, usePassThroughWheelEvents } from '@svelte-draw/svelte'
	import { getUiComponents } from '../context/components'

	const editor = getEditor()
	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
	const passThroughWheelEvents = usePassThroughWheelEvents()

	const path = fromComputed('debug panel path', () => editor.getPath())
	const showFps = fromComputed('show_fps', () => debugFlags.showFps.get())

	const DebugMenu = $derived(components.DebugMenu)

	let fpsElement = $state<HTMLDivElement | null>(null)

	$effect(() => {
		const element = fpsElement
		if (!showFps.current || !element) return

		const TICK_LENGTH = 250
		let maxKnownFps = 0
		let raf = -1

		let start = performance.now()
		let framesInCurrentTick = 0

		// A "tick" is the amount of time between renders. Even though
		// we'll loop on every frame, we will only paint when the time
		// since the last paint is greater than the tick length.

		// When we paint, we'll calculate the FPS based on the number
		// of frames that we've seen since the last time we rendered,
		// and the actual time since the last render.
		function loop() {
			// Count the frame
			framesInCurrentTick++

			// Check if we should render
			const currentTickLength = performance.now() - start

			if (currentTickLength > TICK_LENGTH) {
				// Calculate the FPS and paint it
				const fps = Math.round(
					framesInCurrentTick * (TICK_LENGTH / currentTickLength) * (1000 / TICK_LENGTH)
				)

				if (fps > maxKnownFps) {
					maxKnownFps = fps
				}

				const isSlow = fps < maxKnownFps * 0.75

				element!.textContent = `FPS ${fps.toString()} (max: ${maxKnownFps})`
				element!.className =
					`tlui-debug-panel__fps` + (isSlow ? ` tlui-debug-panel__fps__slow` : ``)

				// Reset the values
				framesInCurrentTick = 0
				start = performance.now()
			}

			raf = editor.timers.requestAnimationFrame(loop)
		}

		loop()

		return () => {
			cancelAnimationFrame(raf)
		}
	})
</script>

<footer {@attach passThroughWheelEvents} class="tlui-debug-panel">
	<div class="tlui-debug-panel__current-state">{`${path.current}`}</div>
	{#if showFps.current}
		<div bind:this={fpsElement}></div>
	{/if}
	{#if DebugMenu}
		<DebugMenu />
	{/if}
</footer>
