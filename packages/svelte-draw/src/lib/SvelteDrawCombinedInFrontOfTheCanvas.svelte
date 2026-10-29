<script lang="ts">
	import { getCustomInFrontOfTheCanvas } from './inFrontOfTheCanvasContext'
	import SvelteDrawUiInFrontOfTheCanvas from './ui/SvelteDrawUiInFrontOfTheCanvas.svelte'

	/**
	 * The default UI's in-front-of-the-canvas layer followed by the app's own `InFrontOfTheCanvas`
	 * component. A Svelte component can't close over the custom component the way the React
	 * `() => <>...</>` wrapper did, so `SvelteDraw` provides it through context.
	 *
	 * @internal
	 */
	const custom = getCustomInFrontOfTheCanvas()
	const Custom = $derived(custom.current)
</script>

<SvelteDrawUiInFrontOfTheCanvas />
{#if Custom}
	<Custom />
{/if}
