import type { TLComponents } from 'svelte-draw'
import BackgroundThemeSelect from './BackgroundThemeSelect.svelte'
import ThemedBackground from './ThemedBackground.svelte'

export const components: TLComponents = {
	Background: ThemedBackground,
	TopPanel: BackgroundThemeSelect,
}
