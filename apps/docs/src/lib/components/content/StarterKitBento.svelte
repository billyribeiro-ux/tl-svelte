<script lang="ts">
	import { assetUrl } from '#utils/asset-url.js'
	import { cn } from '#utils/cn.js'
	import { KITS, type StarterKitType } from './bento-kits'

	let {
		type,
		href,
		img,
	}: {
		type: StarterKitType
		href: string
		img?: { src: string; alt?: string }
	} = $props()

	const content = $derived(KITS[type])
</script>

{#if content}
	<div class="my-8 rounded-xl border border-zinc-200 bg-zinc-100 p-2 shadow-sm not-prose">
		{#if img}
			<a
				{href}
				class="block relative mb-2 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
			>
				<img
					src={assetUrl(img.src)}
					alt={img.alt || type}
					class="!my-0 h-auto w-full object-cover"
				/>
			</a>
		{/if}

		<div class="grid grid-cols-1 gap-2 md:grid-cols-6">
			{#each content.items as item, i (item.title)}
				<div
					class={cn(
						'flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md',
						i < 3 ? 'md:col-span-2' : 'md:col-span-3'
					)}
				>
					<div>
						<h3 class="mb-2 text-lg font-bold leading-tight text-zinc-900">{item.title}</h3>
						<p class="text-sm leading-relaxed text-zinc-600">{item.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
