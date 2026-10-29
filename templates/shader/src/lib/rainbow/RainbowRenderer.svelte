<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import WebGLCanvas from '../WebGLCanvas.svelte'
	import { shaderConfig } from './config'
	import { RainbowShaderManager } from './RainbowShaderManager'

	const editor = getEditor()
	let canvas = $state<HTMLCanvasElement | null>(null)

	// The counterpart of the React `useLayoutEffect`: build the manager once the canvas is bound,
	// tear it down when the component is destroyed.
	$effect(() => {
		if (!canvas) return
		const manager = new RainbowShaderManager(editor, canvas, shaderConfig)

		const handlePointerMove = (e: PointerEvent) => manager.pointerMove(e.clientX, e.clientY)

		window.addEventListener('pointermove', handlePointerMove)

		return () => {
			window.removeEventListener('pointermove', handlePointerMove)
			manager.dispose()
		}
	})
</script>

<WebGLCanvas bind:canvas config={shaderConfig} />
