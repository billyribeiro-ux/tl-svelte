<script lang="ts">
	import { getActions } from '../../context'
	import { createActionState } from '../../hooks/useActionState.svelte'
	import GroupMenuItem from './GroupMenuItem.svelte'
	import UngroupMenuItem from './UngroupMenuItem.svelte'

	const actions = getActions()
	const canGroup = createActionState(() => actions['group'])
	const canUngroup = createActionState(() => actions['ungroup'])
</script>

{#if !canGroup.current.enabled && canUngroup.current.enabled}
	<UngroupMenuItem />
{:else}
	<GroupMenuItem />
{/if}
