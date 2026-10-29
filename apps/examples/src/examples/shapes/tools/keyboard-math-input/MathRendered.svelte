<script lang="ts">
	import katex from 'katex'
	import { translateToLatex } from './shorthand'

	let { text }: { text: string } = $props()

	const html = $derived(
		text.trim()
			? katex.renderToString(translateToLatex(text), {
					throwOnError: false,
					displayMode: true,
				})
			: ''
	)
</script>

{#if html}
	<!-- KaTeX escapes its input, so this is safe as long as the `trust` option stays off (the default). -->
	<div class="math-rendered">{@html html}</div>
{/if}
