<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements'
	import { assetUrl } from '#utils/asset-url.js'
	import SvelteDrawLink from '#lib/components/common/SvelteDrawLink.svelte'

	// Markdown images and `<Image />` both resolve `/…` static URLs via `assetUrl`.
	let {
		src: srcProp,
		href: hrefProp,
		caption,
		...rest
	}: HTMLImgAttributes & { href?: string; caption?: string } = $props()

	const src = $derived(typeof srcProp === 'string' ? assetUrl(srcProp) : srcProp)
	const href = $derived(hrefProp ?? src)
	// `alt` defaults to the title, but an explicit alt (even an empty one) wins.
	const alt = $derived('alt' in rest ? rest.alt : rest.title)
	const imgProps = $derived({ ...rest, alt })
</script>

<span class="block">
	<SvelteDrawLink
		{href}
		class="block bg-zinc-100 dark:bg-zinc-800 py-1 sm:rounded-2xl -mx-5 sm:mx-0 sm:px-1"
	>
		<img {...imgProps} {src} class="w-full sm:rounded-xl !my-0 shadow" />
	</SvelteDrawLink>
	{#if caption}
		<span class="block text-xs text-zinc-500 mt-3 text-center text-balance">{caption}</span>
	{/if}
	{#if !caption && rest.title}
		<span class="block text-xs text-zinc-500 mt-3 text-center text-balance">{rest.title}</span>
	{/if}
</span>
