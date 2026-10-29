<script lang="ts">
	let { src, caption }: { src: string; caption?: string } = $props()

	// Extracts youtube ID from any format, eg:
	// https://youtu.be/tHQW_K2pEgI
	// https://www.youtube.com/watch?v=tHQW_K2pEgI
	// https://youtu.be/tHQW_K2pEgI?si=sKtDDhygzBezfean
	// https://www.youtube.com/watch?v=tHQW_K2pEgI&si=sKtDDhygzBezfean
	const id = $derived(
		((src.split('/').pop() ?? src).split('v=').pop() ?? src).split('&si=')[0].split('?si=')[0]
	)
</script>

<span class="block mb-5">
	<span class="block bg-zinc-100 dark:bg-zinc-800 py-1 md:rounded-2xl -mx-5 md:mx-0 md:px-1">
		<iframe
			src="https://www.youtube.com/embed/{id}?rel=0"
			title={caption}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
			class="w-full aspect-video md:rounded-xl overflow-hidden !my-0 shadow"
		></iframe>
	</span>
	{#if caption}
		<span class="block text-xs text-zinc-500 mt-3 text-center">{caption}</span>
	{/if}
</span>
