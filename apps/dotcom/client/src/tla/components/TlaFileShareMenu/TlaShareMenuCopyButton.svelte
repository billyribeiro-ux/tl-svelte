<script lang="ts">
	import type { Snippet } from 'svelte'
	import TlaButton from '../TlaButton/TlaButton.svelte'

	// A button that copies something to the clipboard
	let {
		children,
		type = 'primary',
		onClick,
	}: {
		children: Snippet
		onClick(): void | Promise<void>
		type?: 'primary' | 'secondary'
	} = $props()

	let copied = $state(false)
	let isLoading = $state(false)

	async function handleCopyLinkClick() {
		if (copied) return
		isLoading = true
		await onClick()
		copied = true
		isLoading = false
		setTimeout(() => (copied = false), 1000)
	}
</script>

<TlaButton
	variant={type}
	onclick={handleCopyLinkClick}
	iconRight={copied ? 'check' : 'copy'}
	{isLoading}
>
	{@render children()}
</TlaButton>
