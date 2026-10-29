<script lang="ts">
	import { fromComputed, getTranslation } from 'svelte-draw'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import {
		getLocalSessionState,
		setColorThemePreview,
		updateLocalSessionState,
	} from '../../utils/local-session-state'
	import { UI_THEMES } from '../../themes/ui-themes'
	import { getUIThemeIds } from './getUIThemeIds'
	import { messages } from './messages'
	import UIThemeMenuCheckboxItem from './UIThemeMenuCheckboxItem.svelte'

	const THEME_NAMES: Record<string, string> = Object.fromEntries(
		UI_THEMES.map(({ id, name }) => [id, name])
	)

	const msg = getTranslation()
	const colorTheme = fromComputed('colorTheme', () => getLocalSessionState().colorTheme)
	const trackEvent = getSvelteDrawAppUiEvents()
	const defaultThemeLabel = $derived(msg(messages.colorThemeDefault))
	const themeIds = getUIThemeIds()

	function clearThemePreview() {
		setColorThemePreview(null)
	}

	$effect(() => clearThemePreview)
</script>

{#if themeIds.current.length > 0}
	<div
		class="tlui-menu__group"
		role="presentation"
		onpointercancel={clearThemePreview}
		onpointerleave={clearThemePreview}
	>
		{#each themeIds.current as id (id)}
			<UIThemeMenuCheckboxItem
				label={id === 'default' ? defaultThemeLabel : (THEME_NAMES[id] ?? id)}
				checked={colorTheme.current === id}
				onPreview={() => setColorThemePreview(id)}
				onSelect={() => {
					updateLocalSessionState(() => ({ colorTheme: id }))
					clearThemePreview()
					trackEvent('set-color-theme', {
						source: 'user-preferences',
						theme: id,
					})
				}}
			/>
		{/each}
	</div>
{/if}
