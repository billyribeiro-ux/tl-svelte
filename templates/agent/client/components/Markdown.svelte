<script lang="ts">
	import { renderMarkdown } from './chat-history/renderMarkdown'

	let { source }: { source: string } = $props()

	// `renderMarkdown` escapes raw HTML (markdown-it `html: false`), so this is safe for model output.
	const html = $derived(renderMarkdown(source))
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html html}
