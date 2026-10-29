<script lang="ts">
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import CopyMenuItem from './CopyMenuItem.svelte'
	import CutMenuItem from './CutMenuItem.svelte'
	import DeleteMenuItem from './DeleteMenuItem.svelte'
	import DuplicateMenuItem from './DuplicateMenuItem.svelte'
	import PasteMenuItem from './PasteMenuItem.svelte'
</script>

<SvelteDrawUiMenuGroup id="clipboard">
	<CutMenuItem />
	<CopyMenuItem />
	<PasteMenuItem />
	<DuplicateMenuItem />
	<DeleteMenuItem />
</SvelteDrawUiMenuGroup>
