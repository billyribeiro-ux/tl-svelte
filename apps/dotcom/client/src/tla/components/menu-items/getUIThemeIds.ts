import { fromComputed, tryGetEditor } from 'svelte-draw'

/** Was `useUIThemeIds()`. Call during component initialisation; read `.current`. */
export function getUIThemeIds() {
	const editor = tryGetEditor()
	return fromComputed('themeIds', () => (editor ? Object.keys(editor.getThemes()) : []))
}
