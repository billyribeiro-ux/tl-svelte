import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'

// Presentational commenting components. These are svelte-draw-independent and can be used to build
// custom commenting UI. The mention picker, pill, and avatar are re-exported from @svelte-draw/mentions
// so the commenting public API is unchanged.
export {
	Avatar,
	type AvatarProps,
	type CommentAuthor,
	createMentionSuggestion,
	filterMentionMembers,
	Mention,
	MentionList,
	type MentionListProps,
	type MentionMember,
	type MentionProps,
	type MentionSuggestionOptions,
} from '@svelte-draw/mentions'
export { default as Byline, type BylineProps } from './ui/Byline.svelte'
export { default as CommentCard, type CommentCardProps } from './ui/CommentCard.svelte'
export { default as CommentComposer } from './ui/CommentComposer.svelte'
export { type CommentComposerProps } from './ui/comment-composer'
export { type CommentContent } from './ui/content'
export { default as CountBadge, type CountBadgeProps } from './ui/CountBadge.svelte'
export { default as CommentPin, type CommentPinProps } from './ui/CommentPin.svelte'
export { default as CommentThread } from './ui/CommentThread.svelte'
export { type CommentThreadProps } from './ui/comment-thread'
export { default as CommentListItem } from './ui/CommentListItem.svelte'
export { default as CommentsList } from './ui/CommentsList.svelte'
export {
	isOpenInNewTabClick,
	type CommentListItemProps,
	type CommentListItemRenderProps,
	type CommentsListProps,
} from './ui/comments-list'
export { default as EmptyState, type EmptyStateProps } from './ui/EmptyState.svelte'
export { formatFullDateTime, formatRelativeTime } from './ui/format-time'
export {
	DEFAULT_REACTION_EMOJI,
	isAllowedReactionEmoji,
	type EmojiPickerProps,
} from './ui/emoji-picker'
export { default as EmojiPicker } from './ui/EmojiPicker.svelte'
export { default as Reaction, defaultRenderReaction } from './ui/Reaction.svelte'
export { type ReactionProps, type ReactionTooltipProps, type RenderReaction } from './ui/reaction'
export { default as DefaultReactionTooltip } from './ui/DefaultReactionTooltip.svelte'
export { default as DefaultReactionTooltipContent } from './ui/DefaultReactionTooltipContent.svelte'
export { default as ReactionPicker } from './ui/ReactionPicker.svelte'
export { type ReactionPickerProps } from './ui/reaction-picker'
export { default as Reactions } from './ui/Reactions.svelte'
export { type ReactionReactor, type ReactionsProps, type ReactionSummary } from './ui/reactions'
export { default as SendButton, type SendButtonProps } from './ui/SendButton.svelte'

// The svelte-draw-coupled commenting layer: the comment tool, reactive readers over the comment
// records, a rich-text body renderer, and a batteries-included <CanvasComments> overlay. Pairs
// with the presentational components above. The React `use*` hooks became `create*` / `get*`
// functions (call them during component initialisation; the reactive ones return a `{ current }`
// holder), as listed in the table in `svelte-draw`'s `lib/ui/context/index.ts`.
export { registerCommentAnchorLifecycle } from './canvas/anchor-lifecycle'
export { default as CommentBody } from './canvas/CommentBody.svelte'
export { type CommentBodyProps } from './canvas/comment-body'
export {
	deleteComment,
	deleteThread,
	editComment,
	putCommentRecords,
	removeCommentRecords,
	reopenThread,
	resolveThread,
} from './canvas/comment-mutations'
export { default as CommentReactionPicker } from './canvas/CommentReactionPicker.svelte'
export { default as CommentReactions } from './canvas/CommentReactions.svelte'
export {
	summarizeReactions,
	toggleCommentReaction,
	type CommentReactionPickerProps,
	type CommentReactionsProps,
	type ReactionSummaryInput,
} from './canvas/comment-reactions'
export { createCommentReactions } from './canvas/comment-reactions.svelte'
export {
	CommentTool,
	commentToolOverrides,
	commentTools,
	startCommentAt,
} from './canvas/comment-tool'
export {
	getCommentReactions,
	getCommentRecord,
	getComments,
	getCommentThreads,
	getLiveComments,
	getLiveCommentThreads,
	type TLCommentRecord,
} from './canvas/comment-store'
export { type CommentingContext } from './canvas/context'
export { default as CommentsFilterMenu } from './canvas/CommentsFilterMenu.svelte'
export { type CommentsFilterMenuProps } from './canvas/comments-filter-menu'
export { default as CommentsMenuItem } from './canvas/CommentsMenuItem.svelte'
export { default as CanvasComments } from './canvas/CanvasComments.svelte'
export { type CanvasCommentsProps } from './canvas/comments-overlay'
export {
	defaultCanModifyComment,
	defaultCommentingOptions,
	getCanComment,
	getCanModifyComment,
	getCommentingOptions,
	type CommentingComponents,
	type CommentingOptions,
	type CommentModification,
	type CommentModificationContext,
	type ShapeCommentPrecisionContext,
} from './canvas/options'
export {
	createCanComment,
	createCanModifyComment,
	getContextCommentingOptions,
} from './canvas/options.svelte'
export { default as CommentsOverflowMenu } from './canvas/CommentsOverflowMenu.svelte'
export { default as CommentsVisibilityToggle } from './canvas/CommentsVisibilityToggle.svelte'
export { default as CanvasCommentsSidebar } from './canvas/CanvasCommentsSidebar.svelte'
export {
	sortSidebarRows,
	type CanvasCommentsSidebarProps,
	type SidebarRow,
} from './canvas/comments-sidebar'
export { createComments, createCommentThreads, createThreadComments } from './canvas/hooks.svelte'
export { createCommentingEnabled } from './canvas/license.svelte'
export { richTextToPlaintext } from './canvas/rich-text'
export { DEFAULT_SIDEBAR_FILTERS, type SidebarFilters } from './canvas/sidebar-filters'
export {
	commentsHidden,
	commentsSidebarOpen,
	getRevealThreadPending,
	openThreadId,
	revealThread,
	sidebarFilters,
	toggleCommentsHidden,
	toggleCommentsSidebar,
} from './canvas/state'
export {
	createCommentsHidden,
	createCommentsSidebarOpen,
	createOpenThreadId,
	createRevealThreadPending,
	createSidebarFilters,
} from './canvas/state.svelte'
export { anchorPagePoint, focusThread, shapeAnchorAt } from './canvas/thread-state'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
