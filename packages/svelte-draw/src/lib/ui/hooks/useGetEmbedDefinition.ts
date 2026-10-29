import { tryGetEditor } from '@svelte-draw/svelte'
import type { EmbedShapeUtil } from '../../shapes/embed/EmbedShapeUtil'

/** @internal Replaces `useGetEmbedShapeUtil`. */
export function getEmbedShapeUtil() {
	const editor = tryGetEditor()
	if (!editor) return undefined
	if (editor.hasShapeUtil('embed')) {
		return editor.getShapeUtil('embed') as EmbedShapeUtil
	}
	return undefined
}

/** @public Replaces `useGetEmbedDefinition`. */
export function getEmbedDefinition() {
	const embedUtil = getEmbedShapeUtil()
	return (url: string) => {
		return embedUtil ? embedUtil.getEmbedDefinition(url) : undefined
	}
}
