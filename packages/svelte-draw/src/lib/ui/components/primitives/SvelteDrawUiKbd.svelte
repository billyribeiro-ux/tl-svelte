<script lang="ts" module>
	/** @public */
	export interface TLUiKbdProps {
		/**
		 * The keyboard shortcut string, e.g. `cmd+k`. This is a prop rather than `children` (as it
		 * was in React) because Svelte passes element content as a snippet, not a string.
		 */
		keys: string
		visibleOnMobileLayout?: boolean
	}
</script>

<script lang="ts">
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { kbd } from '../../kbd-utils'

	let { keys, visibleOnMobileLayout = false }: TLUiKbdProps = $props()
	const breakpoint = getBreakpoint()
</script>

{#if visibleOnMobileLayout || breakpoint.current >= PORTRAIT_BREAKPOINT.MOBILE}
	<kbd class="tlui-kbd">
		{#each kbd(keys) as k, i (i)}
			<span>{k}</span>
		{/each}
	</kbd>
{/if}
