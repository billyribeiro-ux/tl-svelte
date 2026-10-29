<script lang="ts">
	import { SvelteDrawUiButton, fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()
	// [1]
	const isDark = fromComputed('isDark', () => editor.user.getIsDarkMode())
</script>

<div class="tlui-menu">
	<SvelteDrawUiButton
		type="normal"
		onclick={() =>
			// [2]
			editor.user.updateUserPreferences({ colorScheme: isDark.current ? 'light' : 'dark' })}
	>
		{isDark.current ? 'Switch to light mode' : 'Switch to dark mode'}
	</SvelteDrawUiButton>
</div>

<!--
[1]
`editor.user.getIsDarkMode()` resolves the user's `colorScheme` preference (including
'system') to a boolean. Reading it inside `fromComputed` keeps the button label in sync
when the preference changes from anywhere, e.g. the toggle in the main menu.

[2]
`editor.setColorMode('dark')` is a shorthand for the same preference update.
-->
