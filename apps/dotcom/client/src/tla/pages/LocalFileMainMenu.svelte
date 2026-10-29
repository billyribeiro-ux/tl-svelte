<script lang="ts">
	import {
		DefaultMainMenu,
		DefaultMainMenuContent,
		SvelteDrawUiMenuActionItem,
		SvelteDrawUiMenuGroup,
	} from 'svelte-draw'
</script>

<DefaultMainMenu>
	<SvelteDrawUiMenuGroup id="download">
		<SvelteDrawUiMenuActionItem actionId="save-file-copy" />
	</SvelteDrawUiMenuGroup>
	<DefaultMainMenuContent />
</DefaultMainMenu>
