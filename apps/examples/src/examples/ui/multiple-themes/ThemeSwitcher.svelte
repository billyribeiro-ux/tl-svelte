<script lang="ts">
	import {
		fromComputed,
		getEditor,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		type TLThemeId,
	} from 'svelte-draw'

	// [5]
	const THEME_LABELS: Record<TLThemeId, string> = {
		default: 'Default',
		ocean: 'Ocean',
		sunset: 'Sunset',
	}

	const themeIds = Object.keys(THEME_LABELS) as TLThemeId[]

	const editor = getEditor()
	const currentThemeId = fromComputed('themeId', () => editor.getCurrentThemeId())
</script>

<div class="tlui-menu theme-switcher">
	{#each themeIds as id (id)}
		<SvelteDrawUiButton
			type={currentThemeId.current === id ? 'primary' : 'normal'}
			onclick={() => editor.setCurrentTheme(id)}
		>
			<SvelteDrawUiButtonLabel>{THEME_LABELS[id]}</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{/each}
</div>
