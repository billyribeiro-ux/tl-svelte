<script lang="ts">
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import ToggleLockMenuItem from '../menu-items/ToggleLockMenuItem.svelte'
	import UnlockAllMenuItem from '../menu-items/UnlockAllMenuItem.svelte'
</script>

<SvelteDrawUiMenuGroup id="lock">
	<ToggleLockMenuItem />
	<UnlockAllMenuItem />
</SvelteDrawUiMenuGroup>
