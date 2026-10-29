<script lang="ts">
	import {
		ensureGoogleFontsLoaded,
		GOOGLE_FONTS,
		MAX_CUSTOM_FONTS,
		type GoogleFont,
	} from './palette'

	// Font add flow — dropdown of curated Google Fonts. Selection is atomic
	// (one click = one commit), so no staging needed. Already-added fonts are
	// shown but disabled.
	let {
		addedFamilies,
		addFont,
		isFull,
	}: {
		addedFamilies: string[]
		addFont(font: GoogleFont): void
		isFull: boolean
	} = $props()

	let isOpen = $state(false)
	let containerRef: HTMLDivElement | null = $state(null)

	function open() {
		ensureGoogleFontsLoaded()
		isOpen = true
	}
	function close() {
		isOpen = false
	}

	$effect(() => {
		if (!isOpen) return
		const handler = (e: MouseEvent) => {
			if (!containerRef?.contains(e.target as Node)) close()
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	})
</script>

<div class="color-picker-add-font" bind:this={containerRef}>
	<button
		class="color-picker-button"
		disabled={isFull}
		onclick={() => (isOpen ? close() : open())}
		title={isFull ? `Custom font slots full (${MAX_CUSTOM_FONTS})` : 'Add a Google font'}
	>
		+ Add font
	</button>
	{#if isOpen}
		<div class="color-picker-font-dropdown">
			{#each GOOGLE_FONTS as font (font.name)}
				{@const alreadyAdded = addedFamilies.includes(font.family)}
				<button
					class="color-picker-font-dropdown__item"
					disabled={alreadyAdded}
					onclick={() => {
						addFont(font)
						close()
					}}
				>
					<span style:font-family={font.family}>{font.name}</span>
					{#if alreadyAdded}<span class="color-picker-font-dropdown__added">Added</span>{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
