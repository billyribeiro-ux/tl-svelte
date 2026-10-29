<svelte:options namespace="svg" />

<script lang="ts">
	import { tlenv } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { createGetHashPatternZoomName, TILE_PATTERN_SIZE } from './hashPatternUtils'
	import { usePattern } from './usePattern.svelte'

	const editor = getEditor()
	const pattern = usePattern()
	const getHashPatternZoomName = createGetHashPatternZoomName()

	let container = $state.raw<SVGGElement | null>(null)

	function findHtmlLayerParent(element: Element): HTMLElement | null {
		if (element.classList.contains('tl-html-layer')) return element as HTMLElement
		if (element.parentElement) return findHtmlLayerParent(element.parentElement)
		return null
	}

	$effect(() => {
		if (pattern.isReady && tlenv.isSafari && container) {
			const htmlLayer = findHtmlLayerParent(container)
			if (htmlLayer) {
				// Wait for `patternContext` to be picked up
				editor.timers.requestAnimationFrame(() => {
					htmlLayer.style.display = 'none'

					// Wait for 'display = "none"' to take effect
					editor.timers.requestAnimationFrame(() => {
						htmlLayer.style.display = ''
					})
				})
			}
		}
	})
</script>

<g bind:this={container} data-testid={pattern.isReady ? 'ready-pattern-fill-defs' : undefined}>
	{#each pattern.backgroundUrls as item (getHashPatternZoomName(item.zoom, item.theme))}
		<pattern
			id={getHashPatternZoomName(item.zoom, item.theme)}
			width={TILE_PATTERN_SIZE}
			height={TILE_PATTERN_SIZE}
			patternUnits="userSpaceOnUse"
		>
			<image href={item.url} width={TILE_PATTERN_SIZE} height={TILE_PATTERN_SIZE} />
		</pattern>
	{/each}
</g>
