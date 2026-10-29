<script lang="ts">
	import { createHasShapesOnPage } from '../../hooks'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import CopyAsMenuGroup from './CopyAsMenuGroup.svelte'
	import DownloadOriginalMenuItem from './DownloadOriginalMenuItem.svelte'
	import ExportAsMenuGroup from './ExportAsMenuGroup.svelte'

	const atLeastOneShapeOnPage = createHasShapesOnPage()
</script>

{#if atLeastOneShapeOnPage.current}
	<SvelteDrawUiMenuGroup id="conversions">
		<CopyAsMenuGroup />
		<ExportAsMenuGroup />
		<DownloadOriginalMenuItem />
	</SvelteDrawUiMenuGroup>
{/if}
