<script lang="ts">
	import type { TLUserId } from '@svelte-draw/editor'
	import { usePresence } from '@svelte-draw/svelte'

	let { userId }: { userId: TLUserId } = $props()

	const presence = usePresence(() => userId)
</script>

{#if presence.current}
	<div class="tlui-following-indicator" style:border-color={presence.current.color}></div>
{/if}
