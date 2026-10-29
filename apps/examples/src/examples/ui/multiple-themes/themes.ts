import { DEFAULT_THEME, structuredClone, type TLTheme, type TLThemes } from 'svelte-draw'

// [1]
declare module '@svelte-draw/tlschema' {
	interface TLThemes {
		ocean: TLTheme
		sunset: TLTheme
	}
}

// [2]
const OCEAN_THEME: TLTheme = structuredClone(DEFAULT_THEME)
OCEAN_THEME.id = 'ocean'
OCEAN_THEME.colors.light.blue.solid = '#2b7ab5'
OCEAN_THEME.colors.light.violet.solid = '#6a5acd'
OCEAN_THEME.colors.light.violet.noteFill = '#b8a9e8'
OCEAN_THEME.colors.light.violet.noteText = '#000000'
OCEAN_THEME.colors.dark.blue.solid = '#3a9bd5'
OCEAN_THEME.colors.dark.violet.solid = '#7b6bd4'
OCEAN_THEME.colors.dark.violet.noteFill = '#3a2d6e'
OCEAN_THEME.colors.dark.violet.noteText = '#f2f2f2'

const SUNSET_THEME: TLTheme = structuredClone(DEFAULT_THEME)
SUNSET_THEME.id = 'sunset'
SUNSET_THEME.colors.light.blue.solid = '#e07038'
SUNSET_THEME.colors.light.violet.solid = '#9b4dca'
SUNSET_THEME.colors.light.violet.noteFill = '#dab0f0'
SUNSET_THEME.colors.light.violet.noteText = '#000000'
SUNSET_THEME.colors.dark.blue.solid = '#f0884a'
SUNSET_THEME.colors.dark.violet.solid = '#b060d8'
SUNSET_THEME.colors.dark.violet.noteFill = '#5c2870'
SUNSET_THEME.colors.dark.violet.noteText = '#f2f2f2'

// [3]
export const themes: Partial<TLThemes> = {
	ocean: OCEAN_THEME,
	sunset: SUNSET_THEME,
}
