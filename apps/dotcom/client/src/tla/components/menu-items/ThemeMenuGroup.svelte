<script lang="ts">
	import {
		fromComputed,
		getUiEvents,
		SvelteDrawUiMenuCheckboxItem,
		SvelteDrawUiMenuGroup,
		tryGetEditor,
	} from 'svelte-draw'

	const COLOR_SCHEMES = [
		{ colorScheme: 'light' as const, label: 'theme.light' },
		{ colorScheme: 'dark' as const, label: 'theme.dark' },
		{ colorScheme: 'system' as const, label: 'theme.system' },
	]

	const editor = tryGetEditor()
	const trackEvent = getUiEvents()
	const currentColorScheme = fromComputed('colorScheme', () =>
		editor
			? (editor.user.getUserPreferences().colorScheme ??
				(editor.user.getIsDarkMode() ? 'dark' : 'light'))
			: 'system'
	)
</script>

{#if editor}
	<SvelteDrawUiMenuGroup id="theme">
		{#each COLOR_SCHEMES as { colorScheme, label } (colorScheme)}
			<SvelteDrawUiMenuCheckboxItem
				id={`color-scheme-${colorScheme}`}
				{label}
				checked={colorScheme === currentColorScheme.current}
				readonlyOk
				onSelect={() => {
					editor.user.updateUserPreferences({ colorScheme })
					trackEvent('color-scheme', { source: 'menu', value: colorScheme })
				}}
			/>
		{/each}
	</SvelteDrawUiMenuGroup>
{/if}
