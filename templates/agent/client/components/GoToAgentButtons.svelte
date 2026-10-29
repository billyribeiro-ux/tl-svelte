<script lang="ts">
	import { getAgents } from '../agent/agentAppContext'
	import GoToAgentButton from './GoToAgentButton.svelte'

	// Renders GoToAgentButton for all agents.
	const agents = getAgents()
</script>

{#each agents.current as agent (agent.id)}
	<GoToAgentButton {agent} />
{/each}
