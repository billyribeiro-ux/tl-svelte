<script lang="ts">
	import { cn } from '#utils/cn.js'
	import Button from '#lib/components/common/Button.svelte'

	let {
		class: className,
		src,
		caption,
		tryButton,
	}: { class?: string; src: string; caption?: string; tryButton?: string } = $props()

	let isExampleFocused = $state(false)
	let iframe = $state<HTMLIFrameElement>()

	function handleClick() {
		isExampleFocused = true
		iframe?.focus()
	}
	function handleBlur() {
		isExampleFocused = false
	}
</script>

<div>
	<div class="bg-zinc-100 dark:bg-zinc-700 py-1 md:rounded-2xl -mx-5 md:-mx-1 md:px-1">
		<div
			class={cn(className, 'md:rounded-xl overflow-hidden shadow bg-white dark:bg-zinc-950 relative')}
		>
			<iframe
				bind:this={iframe}
				class="iframe"
				title={caption ?? 'Embedded example'}
				{src}
				width="100%"
				height={550}
				allow="autoplay; clipboard-read; clipboard-write"
				onblur={handleBlur}
			></iframe>
			{#if !isExampleFocused}
				<div
					role="presentation"
					class="absolute inset-0 bg-[#FBFCFE]/50 dark:bg-[#101011]/50 flex items-center justify-center cursor-pointer"
					onclick={handleClick}
				>
					<Button
						onclick={handleClick}
						caption={tryButton ?? 'Try example'}
						icon="play"
						class="shadow"
					/>
				</div>
			{/if}
		</div>
	</div>
	{#if caption}
		<span class="block text-xs text-zinc-500 mt-3">{caption}</span>
	{/if}
</div>
