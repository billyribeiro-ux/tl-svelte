<script lang="ts">
	import SvelteDrawUiColumn from '../SvelteDrawUiColumn.svelte'
	import SvelteDrawUiRow from '../SvelteDrawUiRow.svelte'
	import OrientationProbe from './OrientationProbe.svelte'
</script>

<OrientationProbe name="root" />
<SvelteDrawUiRow data-testid="row" tooltipSide="top">
	<OrientationProbe name="in-row" />
	<SvelteDrawUiRow>
		<OrientationProbe name="row-in-row" />
	</SvelteDrawUiRow>
	<SvelteDrawUiColumn data-testid="column">
		<OrientationProbe name="column-in-row" />
	</SvelteDrawUiColumn>
</SvelteDrawUiRow>
