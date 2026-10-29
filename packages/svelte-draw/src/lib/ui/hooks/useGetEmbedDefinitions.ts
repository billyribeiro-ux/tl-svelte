import { getEmbedShapeUtil } from './useGetEmbedDefinition'

/** @public Replaces `useGetEmbedDefinitions`. Reads the definitions once, at call time. */
export function getEmbedDefinitions() {
	const embedUtil = getEmbedShapeUtil()
	return embedUtil ? embedUtil.getEmbedDefinitions() : []
}
