<script lang="ts">
	import { fromComputed, type Atom } from 'svelte-draw'
	import type { WebGLManagerConfig } from './WebGLManager'

	let {
		config,
		canvas = $bindable(null),
	}: { config: Atom<WebGLManagerConfig, unknown>; canvas?: HTMLCanvasElement | null } = $props()

	// Atoms are not tracked by Svelte; the bridge re-runs this whenever the config changes.
	const isPixelated = fromComputed('config', () => config.get().pixelate)
</script>

<canvas
	bind:this={canvas}
	class={['shader-app__canvas', isPixelated.current && 'shader-app__canvas--pixelated']}
></canvas>
