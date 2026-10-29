<script lang="ts">
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import EditSubmenu from './EditSubmenu.svelte'
	import ExportFileContentSubMenu from './ExportFileContentSubMenu.svelte'
	import ExtrasGroup from './ExtrasGroup.svelte'
	import PreferencesGroup from './PreferencesGroup.svelte'
	import ViewSubmenu from './ViewSubmenu.svelte'
</script>

<SvelteDrawUiMenuGroup id="basic">
	<EditSubmenu />
	<ViewSubmenu />
	<ExportFileContentSubMenu />
	<ExtrasGroup />
</SvelteDrawUiMenuGroup>
<PreferencesGroup />
