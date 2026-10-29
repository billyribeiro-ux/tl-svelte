import { flushSync } from 'svelte'
import {
	commentSchemaRecords,
	createComment,
	createCommentReaction,
	createCommentThread,
	createTLSchema,
	createTLStore,
	defaultBindingUtils,
	defaultShapeUtils,
	defaultTools,
	Editor,
	toRichText,
} from 'svelte-draw'
import { afterEach, describe, expect, it } from 'vitest'
import { putCommentRecords } from './comment-mutations'
import { createCommentReactions } from './comment-reactions.svelte'
import { createComments, createCommentThreads, createThreadComments } from './hooks.svelte'

let editors: Editor[] = []

afterEach(() => {
	for (const editor of editors) editor.dispose()
	editors = []
})

function makeEditor(): Editor {
	const editor = new Editor({
		store: createTLStore({ schema: createTLSchema({ records: commentSchemaRecords }) }),
		shapeUtils: defaultShapeUtils,
		bindingUtils: defaultBindingUtils,
		tools: defaultTools,
		getContainer: () => document.body,
	})
	editors.push(editor)
	return editor
}

function makeThreadWithComment(editor: Editor, text: string, createdBy = 'user1') {
	const pageId = editor.getCurrentPageId()
	const thread = createCommentThread({
		pageId,
		anchor: { type: 'point', x: 0, y: 0 },
		createdBy,
	})
	const comment = createComment({
		threadId: thread.id,
		pageId,
		authorId: createdBy,
		body: toRichText(text),
	})
	return { thread, comment }
}

/** Runs `body` in an effect root, so the readers' signal subscriptions have a scope to live in. */
function inRoot(body: () => void) {
	const cleanup = $effect.root(body)
	cleanup()
}

describe('createCommentThreads', () => {
	it('follows the live thread set as records arrive and are soft-deleted', () => {
		const editor = makeEditor()
		inRoot(() => {
			const threads = createCommentThreads(editor)
			let seen: string[] = []
			$effect(() => {
				seen = threads.current.map((t) => t.id)
			})
			flushSync()
			expect(seen).toEqual([])

			const a = makeThreadWithComment(editor, 'a')
			putCommentRecords(editor, [a.thread, a.comment])
			flushSync()
			expect(seen).toEqual([a.thread.id])

			// A thread whose only comment is soft-deleted has nothing to show.
			putCommentRecords(editor, [{ ...a.comment, isDeleted: true }])
			flushSync()
			expect(seen).toEqual([])
		})
	})
})

describe('createComments', () => {
	it('lists every live comment oldest first', () => {
		const editor = makeEditor()
		inRoot(() => {
			const comments = createComments(editor)
			let seen: string[] = []
			$effect(() => {
				seen = comments.current.map((c) => c.id)
			})
			const a = makeThreadWithComment(editor, 'a')
			const reply = createComment({
				threadId: a.thread.id,
				pageId: editor.getCurrentPageId(),
				authorId: 'user2',
				body: toRichText('b'),
				now: a.comment.createdAt + 1,
			})
			putCommentRecords(editor, [a.thread, reply, a.comment])
			flushSync()
			expect(seen).toEqual([a.comment.id, reply.id])
		})
	})
})

describe('createThreadComments', () => {
	it('follows the thread id getter as well as the store', () => {
		const editor = makeEditor()
		inRoot(() => {
			const a = makeThreadWithComment(editor, 'a')
			const b = makeThreadWithComment(editor, 'b', 'user2')
			putCommentRecords(editor, [a.thread, a.comment, b.thread, b.comment])

			let threadId = $state(a.thread.id)
			const comments = createThreadComments(editor, () => threadId)
			let seen: string[] = []
			$effect(() => {
				seen = comments.current.map((c) => c.id)
			})
			flushSync()
			expect(seen).toEqual([a.comment.id])

			threadId = b.thread.id
			flushSync()
			expect(seen).toEqual([b.comment.id])

			const reply = createComment({
				threadId: b.thread.id,
				pageId: editor.getCurrentPageId(),
				authorId: 'user1',
				body: toRichText('reply'),
				now: b.comment.createdAt + 1,
			})
			putCommentRecords(editor, [reply])
			flushSync()
			expect(seen).toEqual([b.comment.id, reply.id])
		})
	})
})

describe('createCommentReactions', () => {
	it("tracks one comment's reactions, oldest first, following the comment id getter", () => {
		const editor = makeEditor()
		inRoot(() => {
			const a = makeThreadWithComment(editor, 'a')
			const b = makeThreadWithComment(editor, 'b', 'user2')
			putCommentRecords(editor, [a.thread, a.comment, b.thread, b.comment])

			let commentId = $state(a.comment.id)
			const reactions = createCommentReactions(editor, () => commentId)
			let seen: string[] = []
			$effect(() => {
				seen = reactions.current.map((r) => `${r.userId}:${r.emoji}`)
			})
			flushSync()
			expect(seen).toEqual([])

			const late = createCommentReaction({
				commentId: a.comment.id,
				threadId: a.thread.id,
				pageId: a.thread.pageId,
				userId: 'user2',
				emoji: '🎉',
				now: 200,
			})
			const early = createCommentReaction({
				commentId: a.comment.id,
				threadId: a.thread.id,
				pageId: a.thread.pageId,
				userId: 'user1',
				emoji: '👍',
				now: 100,
			})
			const other = createCommentReaction({
				commentId: b.comment.id,
				threadId: b.thread.id,
				pageId: b.thread.pageId,
				userId: 'user1',
				emoji: '🔥',
				now: 150,
			})
			putCommentRecords(editor, [late, early, other])
			flushSync()
			expect(seen).toEqual(['user1:👍', 'user2:🎉'])

			commentId = b.comment.id
			flushSync()
			expect(seen).toEqual(['user1:🔥'])
		})
	})
})
