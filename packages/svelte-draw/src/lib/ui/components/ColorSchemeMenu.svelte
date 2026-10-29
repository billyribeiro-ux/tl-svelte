<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		menuTheme: { id: 'menu.theme', defaultMessage: 'Theme' },
		themeDark: { id: 'theme.dark', defaultMessage: 'Dark' },
		themeLight: { id: 'theme.light', defaultMessage: 'Light' },
		themeSystem: { id: 'theme.system', defaultMessage: 'System' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../context/events'
	import SvelteDrawUiMenuCheckboxItem from './primitives/menus/SvelteDrawUiMenuCheckboxItem.svelte'
	import SvelteDrawUiMenuGroup from './primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from './primitives/menus/SvelteDrawUiMenuSubmenu.svelte'

	const COLOR_SCHEMES = [
		{ colorScheme: 'light' as const, label: messages.themeLight.id },
		{ colorScheme: 'dark' as const, label: messages.themeDark.id },
		{ colorScheme: 'system' as const, label: messages.themeSystem.id },
	]

	const editor = getEditor()
	const trackEvent = getUiEvents()
	const currentColorScheme = fromComputed(
		'colorScheme',
		() =>
			editor.user.getUserPreferences().colorScheme ??
			(editor.user.getIsDarkMode() ? 'dark' : 'light')
	)
</script>

<SvelteDrawUiMenuSubmenu id="help menu color-scheme" label={messages.menuTheme.id}>
	<SvelteDrawUiMenuGroup id="theme">
		{#each COLOR_SCHEMES as { colorScheme, label } (colorScheme)}
			<SvelteDrawUiMenuCheckboxItem
				id={`color-scheme-${colorScheme}`}
				{label}
				checked={colorScheme === currentColorScheme.current}
				readonlyOk
				onSelect={(source) => {
					editor.user.updateUserPreferences({ colorScheme })
					trackEvent('color-scheme', { source, value: colorScheme })
				}}
			/>
		{/each}
	</SvelteDrawUiMenuGroup>
</SvelteDrawUiMenuSubmenu>
