<script lang="ts">
	import ConvertToBookmarkMenuItem from '../menu-items/ConvertToBookmarkMenuItem.svelte'
	import ConvertToEmbedMenuItem from '../menu-items/ConvertToEmbedMenuItem.svelte'
	import EditLinkMenuItem from '../menu-items/EditLinkMenuItem.svelte'
	import FitFrameToContentMenuItem from '../menu-items/FitFrameToContentMenuItem.svelte'
	import FlattenMenuItem from '../menu-items/FlattenMenuItem.svelte'
	import GroupMenuItem from '../menu-items/GroupMenuItem.svelte'
	import RemoveFrameMenuItem from '../menu-items/RemoveFrameMenuItem.svelte'
	import ToggleAutoSizeMenuItem from '../menu-items/ToggleAutoSizeMenuItem.svelte'
	import UngroupMenuItem from '../menu-items/UngroupMenuItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
</script>

<SvelteDrawUiMenuGroup id="misc">
	<GroupMenuItem />
	<UngroupMenuItem />
	<EditLinkMenuItem />
	<ToggleAutoSizeMenuItem />
	<RemoveFrameMenuItem />
	<FitFrameToContentMenuItem />
	<ConvertToEmbedMenuItem />
	<ConvertToBookmarkMenuItem />
	<FlattenMenuItem />
</SvelteDrawUiMenuGroup>
