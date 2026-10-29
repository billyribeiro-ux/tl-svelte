<script lang="ts">
	import { SvelteDrawUiMenuSubmenu, tryGetEditor } from 'svelte-draw'
	import ThemeMenuGroup from './ThemeMenuGroup.svelte'
	import UIThemeMenuGroup from './UIThemeMenuGroup.svelte'

	const editor = tryGetEditor()
</script>

{#if editor}
	<SvelteDrawUiMenuSubmenu id="theme" label="menu.theme">
		<div class="tlui-language-menu">
			<ThemeMenuGroup />
			<UIThemeMenuGroup />
		</div>
	</SvelteDrawUiMenuSubmenu>
{/if}
