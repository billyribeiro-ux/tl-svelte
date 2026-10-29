<script lang="ts">
	import { createColorMode, fromComputed, getEditor } from 'svelte-draw'
	import { fluidConfig } from './config'
	import { FluidManager } from './FluidManager'

	/**
	 * Renders the fluid simulation canvas.
	 * Initializes and manages the FluidManager lifecycle, including:
	 * - WebGL context setup
	 * - Pointer event handling
	 * - Cleanup on unmount
	 */
	const editor = getEditor()
	let canvas = $state<HTMLCanvasElement | null>(null)
	const colorMode = createColorMode(editor)
	const darkMode = $derived(colorMode.current === 'dark')

	const config = fromComputed('config', () => fluidConfig.get())

	// Initialize FluidManager. Re-runs (and rebuilds the manager) whenever the canvas, the color
	// mode or the config changes, exactly like the React effect's dependency list.
	$effect(() => {
		if (!canvas) return
		const manager = new FluidManager(canvas, editor, config.current)

		// Initialize the WebGL context and start the animation loop
		manager.initialize(darkMode)

		function handlePointerDown(e: PointerEvent) {
			const elm = e.target! as HTMLElement
			elm.setPointerCapture(e.pointerId)
			manager.handlePointerDown()
		}

		function handlePointerUp(e: PointerEvent) {
			const elm = e.target! as HTMLElement
			elm.releasePointerCapture(e.pointerId)
			manager.handlePointerUp()
		}

		function handlePointerMove() {
			manager.handlePointerMove()
		}

		document.addEventListener('pointermove', handlePointerMove)
		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('pointerup', handlePointerUp)

		return () => {
			document.removeEventListener('pointermove', handlePointerMove)
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('pointerup', handlePointerUp)

			manager.handlePointerUp()
			manager.dispose()
		}
	})
</script>

<canvas
	bind:this={canvas}
	class={['shader-app__canvas', config.current.pixelate && 'shader-app__canvas--pixelated']}
></canvas>
