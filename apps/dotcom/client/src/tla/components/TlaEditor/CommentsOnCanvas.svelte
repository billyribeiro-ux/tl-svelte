<script lang="ts" module>
	import type { CommentAuthor } from '@svelte-draw/commenting'
	import { defineMessages } from 'svelte-draw'

	export { getAnonCommentToolOverrides } from './anonCommentToolOverrides.svelte'

	const commentMessages = defineMessages({
		// Matches the notifications panel and the toolkit's own byline default for an unnamed author.
		unknownAuthor: { defaultMessage: 'Someone' },
	})

	/** Value equality for the presence-author maps: same ids, each with the same name and color. */
	function presenceAuthorsEqual(
		a: ReadonlyMap<string, CommentAuthor>,
		b: ReadonlyMap<string, CommentAuthor>
	): boolean {
		if (a.size !== b.size) return false
		for (const [id, author] of b) {
			const prev = a.get(id)
			if (!prev || prev.name !== author.name || prev.color !== author.color) return false
		}
		return true
	}
</script>

<script lang="ts">
	import type { QueryResultType } from '@rocicorp/zero'
	import {
		CanvasComments,
		CanvasCommentsSidebar,
		filterMentionMembers,
		type CommentingContext,
		type MentionMember,
	} from '@svelte-draw/commenting'
	import { queries } from '@svelte-draw/dotcom-shared'
	import { untrack } from 'svelte'
	import { fromComputed, getEditor, getTranslation } from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getCommentTracking } from '../../hooks/useCommentTracking.svelte'
	import { latestForeignReactionAt } from '../TlaSidebar/components/commentNotifications'

	type FileComments = QueryResultType<typeof queries.fileComments>
	type FileVisitors = QueryResultType<typeof queries.fileVisitors>

	/**
	 * dotcom's comments layer: a thin consumer of `@svelte-draw/commenting`'s `<CanvasComments>`.
	 * All the flow (tool, pins, thread popovers, composer, rich-text bodies) lives in the toolkit;
	 * dotcom only supplies the pieces that are its own — the signed-in user's id, an author resolver
	 * (current user from preferences, other authors from the Zero comments query's denormalized
	 * author fields, with live presence as a fallback for users who haven't committed a comment yet,
	 * e.g. a draft composer's byline), and comment read status from Zero's read receipts.
	 *
	 * Read status and author names come from a Zero query scoped to this one file (not the app-level
	 * notifications feed, which is bounded to recent comments), so every unread pin resolves however
	 * old the comment is.
	 */
	let { fileId }: { fileId: string } = $props()

	const msg = getTranslation()
	const editor = getEditor()
	const app = getMaybeApp()
	const currentUserId = $derived(app.current?.userId ?? null)
	getCommentTracking()
	// Guests who signed in by email have no name yet, so their roster rows would be blank. Name them
	// the same way the rest of the commenting UI names an author it can't resolve.
	const unknownAuthor = $derived(msg(commentMessages.unknownAuthor))

	const currentUser = fromComputed('current user', (): CommentAuthor => {
		const currentApp = app.current
		if (!currentApp) return { name: 'You' }
		const prefs = currentApp.tlUser.userPreferences.get()
		return {
			name: prefs.name || 'You',
			color: prefs.color ?? undefined,
		}
	})

	/** A live view of a Zero query scoped to one file, resubscribed when the file changes and
	 *  destroyed on unmount. */
	function createFileQuery<T extends readonly unknown[]>(
		query: (args: { fileId: string }) => unknown
	): { readonly current: T } {
		let data = $state.raw<T>([] as unknown as T)
		$effect(() => {
			const currentApp = app.current
			const id = fileId
			if (!currentApp) return
			return untrack(() => {
				const view = currentApp.materializeQuery<T>(query({ fileId: id }))
				data = view.data
				const unlisten = view.addListener((next) => {
					data = next as T
				})
				return () => {
					unlisten()
					view.destroy()
				}
			})
		})
		return {
			get current() {
				return data
			},
		}
	}

	// This file's comments (denormalized author fields + the caller's read receipts), and everyone
	// who has opened it (identity denormalized onto their file_visitor row — see migration 044) so
	// past viewers — not just workspace members — can be @-mentioned.
	const fileComments = createFileQuery<FileComments>(queries.fileComments)
	const fileVisitors = createFileQuery<FileVisitors>(queries.fileVisitors)

	const commentAuthors = $derived.by(() => {
		const authors = new Map<string, CommentAuthor>()
		for (const c of fileComments.current) {
			if (c.authorName) {
				authors.set(c.authorId, {
					name: c.authorName,
					color: c.authorColor || undefined,
				})
			}
		}
		return authors
	})

	// Ids of unread comments: others' comments with no read receipt, plus own comments whose
	// newest foreign reaction postdates the receipt — so opening the thread writes/advances the
	// receipt and clears the "reacted to your comment" notification. Zero comment row ids are
	// TLComment record ids verbatim, so these map straight onto store records.
	const unreadCommentIds = $derived.by(() => {
		const ids = new Set<string>()
		const userId = currentUserId
		for (const c of fileComments.current) {
			if (c.authorId !== userId) {
				if (!c.read) ids.add(c.id)
			} else {
				const latestForeign = latestForeignReactionAt(c.reactions, userId)
				if (latestForeign !== undefined && latestForeign > (c.read?.readAt ?? -Infinity))
					ids.add(c.id)
			}
		}
		return ids
	})

	// Presence changes on every cursor move, dozens of times a second, but the id → name/color it
	// derives to almost never does. Holding the Map's identity keeps the computed's epoch still, so
	// cursor movement doesn't re-render the pins overlay and sidebar.
	let presenceAuthorsPrevious: Map<string, CommentAuthor> = new Map()
	const presenceAuthors = fromComputed('presence authors', () => {
		const authors = new Map<string, CommentAuthor>()
		for (const p of editor.store.query.records('instance_presence').get()) {
			if (p.userName) {
				authors.set(p.userId.replace(/^user:/, ''), { name: p.userName, color: p.color })
			}
		}
		if (presenceAuthorsEqual(presenceAuthorsPrevious, authors)) {
			return presenceAuthorsPrevious
		}
		presenceAuthorsPrevious = authors
		return authors
	})
	// The @-mention roster: the members of the workspace that owns this file. The Svelte inputs are
	// captured outside the computed, which does not track Svelte state.
	const mentionMembers = $derived.by(() => {
		const id = fileId
		const unknown = unknownAuthor
		return fromComputed('mention members', () => {
			const currentApp = app.current
			if (!currentApp) return []
			const workspaceId = currentApp.getFile(id)?.owningGroupId
			if (!workspaceId) return []
			const membership = currentApp.getWorkspaceMembership(workspaceId)
			if (!membership) return []
			return membership.groupMembers.map((m) => ({
				id: m.userId,
				name: m.userName || unknown,
				color: m.userColor,
				you: m.userId === currentApp.userId,
			}))
		})
	})
	// The past-viewer half of the roster: everyone who has opened this file. Their rows are trigger-
	// written from the user row, so a blank userName is a nameless guest rather than a missing
	// join — same fallback as members. The query already excludes the current user, so `you` is
	// never set here.
	const viewerMembers = $derived(
		fileVisitors.current.map((v) => ({
			id: v.userId,
			name: v.userName || unknownAuthor,
			color: v.userColor || undefined,
		}))
	)
	// The full @-mention roster: workspace members plus any past viewer who isn't already a member.
	// Members win on id collision: both sources are trigger-synced to the user row, but member
	// entries carry the `you` flag, so they're the richer representation of the same identity.
	const roster = $derived.by(() => {
		const byId = new Map<string, MentionMember>(mentionMembers.current.map((m) => [m.id, m]))
		for (const v of viewerMembers) {
			if (!byId.has(v.id)) byId.set(v.id, v)
		}
		return [...byId.values()]
	})
	// Roster authors keyed by id — a MentionMember is a CommentAuthor. The roster is the id→name
	// source for a mentioned member or viewer who's committed no comment and isn't currently present —
	// without it, they resolve to nothing and render as the byline default rather than their name.
	const memberAuthors = $derived(new Map<string, CommentAuthor>(roster.map((m) => [m.id, m])))
	// Resolve an id to current display info from the sources the client has: self, comment
	// authors, live presence, and the mention roster (workspace members and past viewers). Returns
	// undefined when none can resolve the id (e.g. a deleted account) — the client has no global user
	// directory — so the toolkit falls back to a mention's stored label, or a generic byline default.
	function resolveAuthor(id: string): CommentAuthor | undefined {
		if (id === currentUserId) return currentUser.current
		return commentAuthors.get(id) ?? presenceAuthors.current.get(id) ?? memberAuthors.get(id)
	}
	function isCommentUnread(commentId: string) {
		return unreadCommentIds.has(commentId)
	}
	function onCommentsRead(commentIds: string[]) {
		return app.current?.markCommentsRead(commentIds)
	}
	function getMentionSuggestions(query: string) {
		return filterMentionMembers(roster, query)
	}
	// A thread's deep link into this file, so surfaces can offer open-in-new-tab.
	function getThreadHref(threadId: string) {
		return `${routes.tlaFile(fileId)}?comment=${encodeURIComponent(threadId)}`
	}

	// Both surfaces read the same context — the signed-in user, the author resolver, read status —
	// so it's built once here and spread into each rather than repeated on both.
	const commenting = $derived<CommentingContext>({
		currentUserId,
		resolveAuthor,
		isCommentUnread: app.current ? isCommentUnread : undefined,
		onCommentsRead: app.current ? onCommentsRead : undefined,
		getMentionSuggestions,
		getThreadHref,
	})
</script>

<CanvasComments {...commenting} />
<CanvasCommentsSidebar {...commenting} />
