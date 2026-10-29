<script lang="ts">
	import type { AgentIconType } from '../../shared/icons/agentIconTypes'
	import AgentIcon from '../../shared/icons/AgentIcon.svelte'

	let {
		text,
		icon,
		onClick,
	}: {
		text: string
		icon: AgentIconType
		onClick?: () => void
	} = $props()
</script>

{#if onClick}
	<button type="button" class="prompt-tag" onclick={onClick}>
		<AgentIcon type={icon} /> <span>{text}</span>
	</button>
{:else}
	<div class="prompt-tag">
		<AgentIcon type={icon} /> <span>{text}</span>
	</div>
{/if}
