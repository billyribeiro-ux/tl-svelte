<script lang="ts">
	import SvelteDrawLink from '#lib/components/common/SvelteDrawLink.svelte'

	let {
		src,
		href,
		thumbnail,
		caption,
		lazy = false,
		autoplay = false,
	}: {
		src: string
		thumbnail?: string
		caption?: string
		autoplay?: boolean
		href?: string
		lazy?: boolean
	} = $props()
</script>

<span class="block">
	<SvelteDrawLink
		href={href ?? src}
		target="_blank"
		rel="noreferrer"
		class="block bg-zinc-100 dark:bg-zinc-800 py-1 sm:rounded-2xl sm:px-1"
	>
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			class="w-full sm:rounded-xl !my-0 shadow"
			{src}
			poster={thumbnail}
			controls={false}
			preload={lazy ? 'metadata' : 'auto'}
			{autoplay}
			muted={autoplay}
			loop={autoplay}
		></video>
	</SvelteDrawLink>
	{#if caption}
		<span class="block text-xs text-zinc-500 mt-3 text-center">{caption}</span>
	{/if}
</span>
