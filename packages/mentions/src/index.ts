import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'

// Presentational mention components. These are svelte-draw-independent and can be used to build custom
// mention UI.
export { default as Avatar } from './Avatar.svelte'
export { type CommentAuthor } from './comment-author'
export { default as Mention } from './Mention.svelte'
export { default as MentionList } from './MentionList.svelte'
export type { AvatarProps, MentionListProps, MentionMember, MentionProps } from './types'

// The TipTap mention node + `@`-picker suggestion. Add the node to a rich-text editor's extensions
// (comments composer, shape rich text) to render mention pills and — when a suggestion is provided —
// drive the picker.
export { createMentionExtension, type MentionExtensionOptions } from './mention-extension'
export {
	createMentionSuggestion,
	filterMentionMembers,
	isMentionPickerOpen,
	type MentionSuggestionOptions,
} from './mention-suggestion.svelte'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
