<!-- TEST HARNESS: renders SvelteDraw with a `children` snippet, so a test can swap props in place. -->
<script lang="ts">
	import SvelteDraw, { type SvelteDrawProps } from '../SvelteDraw.svelte'

	let { drawProps, childTestId }: { drawProps: SvelteDrawProps; childTestId?: string } = $props()
</script>

{#if childTestId}
	<SvelteDraw {...drawProps}>
		<div data-testid={childTestId}></div>
	</SvelteDraw>
{:else}
	<SvelteDraw {...drawProps} />
{/if}
