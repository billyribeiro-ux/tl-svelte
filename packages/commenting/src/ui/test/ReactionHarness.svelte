<script lang="ts">
	import { SvelteDrawUiTooltipProvider } from 'svelte-draw'
	import Reaction from '../Reaction.svelte'
	import type { ReactionProps } from '../reaction'

	/** Mounts a `Reaction` inside the tooltip provider its hover list needs. */
	let props: ReactionProps = $props()
</script>

<SvelteDrawUiTooltipProvider>
	<Reaction {...props} />
</SvelteDrawUiTooltipProvider>
