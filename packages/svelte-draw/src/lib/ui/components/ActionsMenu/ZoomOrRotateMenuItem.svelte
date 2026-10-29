<script lang="ts">
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import ZoomTo100MenuItem from '../menu-items/ZoomTo100MenuItem.svelte'
	import RotateCCWMenuItem from './RotateCCWMenuItem.svelte'

	const breakpoint = getBreakpoint()
</script>

{#if breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM}
	<ZoomTo100MenuItem />
{:else}
	<RotateCCWMenuItem />
{/if}
