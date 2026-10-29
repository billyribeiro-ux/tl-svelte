import type { TLEditorSnapshot } from 'svelte-draw'

export interface SvelteDrawProviderMetadata {
	snapshot: TLEditorSnapshot
	imageName: string
}

export interface WhiteboardImage {
	id: string
	name: string
	url: string
	snapshot: TLEditorSnapshot
	type: string
	width: number
	height: number
}

export type ImageClickTarget = SvelteDrawProviderMetadata | { uploadedFile: File }
