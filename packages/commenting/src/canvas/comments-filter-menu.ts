/** @public */
export interface CommentsFilterMenuProps {
	/** Whether to offer the "only your threads" toggle (needs a known current user). */
	canFilterByAuthor?: boolean
	/** Whether to offer the "only unread" toggle (needs a read-status source). */
	canFilterByUnread?: boolean
}
