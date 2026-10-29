<script lang="ts">
	import { getTranslation, SvelteDrawUiMenuSubmenu } from 'svelte-draw'
	import { getUIThemeIds } from './getUIThemeIds'
	import { messages } from './messages'
	import UIThemeMenuGroup from './UIThemeMenuGroup.svelte'

	const msg = getTranslation()
	const themeIds = getUIThemeIds()
</script>

{#if themeIds.current.length > 0}
	<SvelteDrawUiMenuSubmenu id="ui-theme" label={msg(messages.colorTheme)}>
		<UIThemeMenuGroup />
	</SvelteDrawUiMenuSubmenu>
{/if}
