<script lang="ts">
	import type { Snippet } from 'svelte'

	let { roomId, children }: { roomId?: string; children: Snippet } = $props()

	let didCopy = $state(false)

	$effect(() => {
		if (!didCopy) return
		const timeout = setTimeout(() => (didCopy = false), 3000)
		return () => clearTimeout(timeout)
	})

	function copyLink() {
		navigator.clipboard.writeText(window.location.href)
		didCopy = true
	}
</script>

<div class="RoomWrapper">
	<div class="RoomWrapper-header">
		<!-- wifi icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			width={16}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
			/>
		</svg>
		<div>{roomId}</div>
		<button class="RoomWrapper-copy" onclick={copyLink} aria-label="copy room link">
			Copy link
			{#if didCopy}<div class="RoomWrapper-copied">Copied!</div>{/if}
		</button>
	</div>
	<div class="RoomWrapper-content">{@render children()}</div>
</div>
