<script lang="ts">
	import type { ExampleFile } from '#lib/page-data.js'
	import CodeFiles from './CodeFiles.svelte'
	import Embed from './Embed.svelte'

	let { slug, files }: { slug: string; files: ExampleFile[] } = $props()

	// The examples app serves each example at `/<slug>/full`; the URLs are unchanged.
	const server = 'https://examples.svelte-draw.invalid'
</script>

<div class="w-full mt-8">
	<Embed src="{server}/{slug}/full?utm_source=docs-embed" />
	<CodeFiles {files} />
</div>
