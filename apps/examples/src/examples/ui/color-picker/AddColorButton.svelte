<script lang="ts">
	import { MAX_CUSTOM_COLORS, randomHex } from './palette'

	// Color add flow — the native picker opens immediately on "+ Add color".
	// The picker fires `input` continuously while dragging, so we stage a preview
	// and only commit on the explicit Add button.
	let { addColor, isFull }: { addColor(hex: string): void; isFull: boolean } = $props()

	let isStaging = $state(false)
	let staged = $state(randomHex())
	let inputRef: HTMLInputElement | null = $state(null)

	function open() {
		staged = randomHex()
		isStaging = true
		inputRef?.click()
	}
	function reopen() {
		inputRef?.click()
	}
	function commit() {
		addColor(staged)
		isStaging = false
	}
	function cancel() {
		isStaging = false
	}
</script>

<div class="color-picker-add-color">
	<input
		bind:this={inputRef}
		type="color"
		bind:value={staged}
		class="color-picker-add-color__input"
		aria-hidden="true"
		tabindex={-1}
	/>
	{#if isStaging}
		<div class="color-picker-add-color__staging">
			<button
				type="button"
				class="color-picker-add-color__swatch"
				style:background={staged}
				onclick={reopen}
				aria-label="Change color"
			></button>
			<span class="color-picker-add-color__hex">{staged.toUpperCase()}</span>
			<button class="color-picker-button color-picker-button--primary" onclick={commit}>
				Add
			</button>
			<button
				class="color-picker-button color-picker-button--icon"
				onclick={cancel}
				aria-label="Cancel"
			>
				×
			</button>
		</div>
	{:else}
		<button
			class="color-picker-button"
			disabled={isFull}
			onclick={open}
			title={isFull ? `Custom color slots full (${MAX_CUSTOM_COLORS})` : 'Add a custom color'}
		>
			+ Add color
		</button>
	{/if}
</div>
