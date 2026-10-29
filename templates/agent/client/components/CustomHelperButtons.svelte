<script lang="ts">
	import {
		DefaultHelperButtons,
		DefaultHelperButtonsContent,
		SvelteDrawUiMenuContextProvider,
	} from 'svelte-draw'
	import { tryGetAgentAppHolder } from '../agent/agentAppContext'
	import GoToAgentButtons from './GoToAgentButtons.svelte'

	// Custom components that need the agent app (the React version only rendered once `app` existed)
	const holder = tryGetAgentAppHolder()
</script>

{#if holder?.current}
	{#key holder.current}
		<DefaultHelperButtons>
			<SvelteDrawUiMenuContextProvider type="helper-buttons" sourceId="helper-buttons">
				<DefaultHelperButtonsContent />
				<GoToAgentButtons />
			</SvelteDrawUiMenuContextProvider>
		</DefaultHelperButtons>
	{/key}
{/if}
