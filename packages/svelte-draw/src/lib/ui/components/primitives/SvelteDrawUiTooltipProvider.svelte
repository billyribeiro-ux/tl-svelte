<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface SvelteDrawUiTooltipProviderProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import { Tooltip } from 'bits-ui'
	import { setHasTooltipProvider } from './tooltipContext'
	import TooltipSingleton from './TooltipSingleton.svelte'

	let { children }: SvelteDrawUiTooltipProviderProps = $props()

	setHasTooltipProvider()
</script>

<Tooltip.Provider skipDelayDuration={700}>
	{@render children?.()}
	<TooltipSingleton />
</Tooltip.Provider>
