<script lang="ts">
	import { Box, SVGContainer, fromComputed, getEditor } from 'svelte-draw'
	import { getPdf } from './pdfContext'

	const editor = getEditor()
	const pdf = getPdf()

	function pathForPageBounds(bounds: Box) {
		return `M ${bounds.x} ${bounds.y} L ${bounds.maxX} ${bounds.y} L ${bounds.maxX} ${bounds.maxY} L ${bounds.x} ${bounds.maxY} Z`
	}

	// [6]
	const overlay = fromComputed('pdf page overlay', () => {
		const viewportPageBounds = editor.getViewportPageBounds()

		const relevantPageBounds = pdf.current.pages
			.map((page) => {
				if (!viewportPageBounds.collides(page.bounds)) return null
				return page.bounds
			})
			.filter((bounds): bounds is Box => bounds !== null)

		const viewportPath = pathForPageBounds(viewportPageBounds)

		return {
			path: `${viewportPath} ${relevantPageBounds.map(pathForPageBounds).join(' ')}`,
			relevantPageBounds,
		}
	})
</script>

<SVGContainer class="PageOverlayScreen-screen">
	<path d={overlay.current.path} fill-rule="evenodd" />
</SVGContainer>
{#each overlay.current.relevantPageBounds as bounds, i (i)}
	<div
		class="PageOverlayScreen-outline"
		style:width="{bounds.w}px"
		style:height="{bounds.h}px"
		style:transform="translate({bounds.x}px, {bounds.y}px)"
	></div>
{/each}

<!--
[6]
The overlay is an SVG in page space with an even-odd path: the viewport rectangle minus each
visible page rectangle, filled with a translucent background color. Only pages that collide
with the viewport are drawn.
-->
