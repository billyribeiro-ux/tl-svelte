<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		menuLanguage: { id: 'menu.language', defaultMessage: 'Language' },
	})
</script>

<script lang="ts">
	import { LANGUAGES } from '@svelte-draw/editor'
	import { fromComputed, tryGetEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../context/events'
	import SvelteDrawUiMenuCheckboxItem from './primitives/menus/SvelteDrawUiMenuCheckboxItem.svelte'
	import SvelteDrawUiMenuGroup from './primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from './primitives/menus/SvelteDrawUiMenuSubmenu.svelte'

	const editor = tryGetEditor()
	const trackEvent = getUiEvents()
	const currentLanguage = fromComputed('locale', () => editor?.user.getLocale())
</script>

{#if editor}
	<SvelteDrawUiMenuSubmenu id="help menu language" label={messages.menuLanguage.id}>
		<SvelteDrawUiMenuGroup id="languages" class="tlui-language-menu">
			{#each LANGUAGES as { locale, label } (locale)}
				<SvelteDrawUiMenuCheckboxItem
					id={`language-${locale}`}
					lang={locale}
					title={locale}
					{label}
					checked={locale === currentLanguage.current}
					readonlyOk
					onSelect={(source) => {
						editor.user.updateUserPreferences({ locale })
						trackEvent('change-language', { source, locale })
					}}
				/>
			{/each}
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
{/if}
