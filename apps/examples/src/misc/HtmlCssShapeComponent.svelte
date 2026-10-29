<script lang="ts">
	import { createUniqueSafeId } from '@svelte-draw/svelte'
	import type { HtmlCssShape } from './HtmlCssShapeUtil'

	let { shape }: { shape: HtmlCssShape } = $props()

	const id = createUniqueSafeId()

	// The shape's CSS goes into a <style> in <head> for as long as the shape is mounted.
	$effect(() => {
		const style = document.createElement('style')
		// tests can use #self in their CSS to refer uniquely to this shape so we can test how well
		// CSS in <head> is applied to the shape when exporting.
		style.textContent = shape.props.css.replace(/#self/g, `#${id}`)
		document.head.appendChild(style)
		return () => {
			document.head.removeChild(style)
		}
	})
</script>

<div {id}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- e2e fixture: the shape renders raw html -->
	{@html shape.props.html}
</div>
