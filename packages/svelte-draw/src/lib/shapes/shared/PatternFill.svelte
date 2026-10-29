<svelte:options namespace="svg" />

<script lang="ts">
	import {
		createColorMode,
		createUniqueSafeId,
		fromComputed,
		getEditor,
		getSvgExportContext,
	} from '@svelte-draw/svelte'
	import { createGetHashPatternZoomName } from './hashPatternUtils'

	let {
		d,
		fillColor,
		patternFillFallbackColor,
		scale = 1,
	}: {
		d: string
		fillColor: string
		patternFillFallbackColor: string
		scale?: number
	} = $props()

	const editor = getEditor()
	const svgExport = getSvgExportContext()
	const zoomLevel = fromComputed('zoomLevel', () => editor.getEfficientZoomLevel())
	const colorMode = createColorMode(editor, () => svgExport?.colorMode)
	const getHashPatternZoomName = createGetHashPatternZoomName()
	const scaledPatternId = createUniqueSafeId()

	const effectiveZoom = $derived(zoomLevel.current * scale)
	const teenyTiny = $derived(effectiveZoom <= 0.18)
	const sharedPatternId = $derived(getHashPatternZoomName(effectiveZoom, colorMode.current))
	const patternFill = $derived(
		svgExport
			? `url(#${getHashPatternZoomName(1, colorMode.current)})`
			: teenyTiny
				? patternFillFallbackColor
				: scale !== 1
					? `url(#${scaledPatternId})`
					: `url(#${sharedPatternId})`
	)
</script>

{#if !svgExport && !teenyTiny && scale !== 1}
	<pattern id={scaledPatternId} href="#{sharedPatternId}" patternTransform="scale({scale})" />
{/if}
<path fill={fillColor} {d} />
<path fill={patternFill} {d} />
