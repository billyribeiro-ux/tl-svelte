<script lang="ts">
	import type { ChatHistoryGroup } from './chatHistoryGroups'
	import ChatHistoryGroupWithDiff from './ChatHistoryGroupWithDiff.svelte'
	import ChatHistoryGroupWithoutDiff from './ChatHistoryGroupWithoutDiff.svelte'

	let { group }: { group: ChatHistoryGroup } = $props()
</script>

{#if group.withDiff}
	<ChatHistoryGroupWithDiff {group} />
{:else}
	<ChatHistoryGroupWithoutDiff {group} />
{/if}
