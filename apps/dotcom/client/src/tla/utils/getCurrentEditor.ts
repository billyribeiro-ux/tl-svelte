import { Editor } from 'svelte-draw'

export function getCurrentEditor() {
	return (window as any).editor as Editor | undefined
}
