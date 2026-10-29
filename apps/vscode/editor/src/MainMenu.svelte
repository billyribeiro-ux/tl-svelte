<script lang="ts">
	import {
		DefaultMainMenu,
		EditSubmenu,
		ExportFileContentSubMenu,
		ExtrasGroup,
		PreferencesGroup,
		ViewSubmenu,
	} from 'svelte-draw'
	import Links from './Links.svelte'
</script>

<DefaultMainMenu>
	<EditSubmenu />
	<ViewSubmenu />
	<ExportFileContentSubMenu />
	<ExtrasGroup />
	<PreferencesGroup />
	<Links />
</DefaultMainMenu>
