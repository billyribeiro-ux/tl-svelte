import type { TLRichText } from 'svelte-draw'

/** @public */
export interface CommentBodyProps {
	richText: TLRichText
	/** Maps a member id to its current display name, so \@mentions show the live name. */
	resolveName?(id: string): string | undefined
}
