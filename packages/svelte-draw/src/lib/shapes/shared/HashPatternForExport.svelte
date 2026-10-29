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

	const editor = getEditor()
	const svgExport = getSvgExportContext()
	const getHashPatternZoomName = createGetHashPatternZoomName()
	const maskId = createUniqueSafeId()
	const colorMode = createColorMode(editor, () => svgExport?.colorMode)
	const theme = fromComputed('currentTheme', () => editor.getCurrentTheme())

	const colors = $derived(theme.current.colors[colorMode.current])
	const t = 8 / 12
</script>

<mask id={maskId}>
	<rect x="0" y="0" width="8" height="8" fill="white" />
	<g stroke-linecap="round" stroke="black">
		<line x1={t * 1} y1={t * 3} x2={t * 3} y2={t * 1} />
		<line x1={t * 5} y1={t * 7} x2={t * 7} y2={t * 5} />
		<line x1={t * 9} y1={t * 11} x2={t * 11} y2={t * 9} />
	</g>
</mask>
<pattern
	id={getHashPatternZoomName(1, colorMode.current)}
	width="8"
	height="8"
	patternUnits="userSpaceOnUse"
>
	<rect x="0" y="0" width="8" height="8" fill={colors.solid} mask="url(#{maskId})" />
</pattern>
