import { flushSync } from 'svelte'
import {
	commentSchemaRecords,
	createCommentThread,
	createTLSchema,
	createTLStore,
	defaultBindingUtils,
	defaultShapeUtils,
	defaultTools,
	Editor,
	type TLCommentThread,
} from 'svelte-draw'
import { afterEach, describe, expect, it } from 'vitest'
import { createClusterModel } from './cluster-model.svelte'

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

function threadAt(editor: Editor, x: number, y: number): TLCommentThread {
	return createCommentThread({
		pageId: editor.getCurrentPageId(),
		anchor: { type: 'point', x, y },
		createdBy: 'user1',
	})
}

/** Runs `body` inside an effect root so the controller's effects are live, and tears it down. */
function withModel(
	editor: Editor,
	initial: TLCommentThread[],
	body: (api: {
		model: ReturnType<typeof createClusterModel>
		setThreads(next: TLCommentThread[]): void
	}) => void
) {
	const cleanup = $effect.root(() => {
		let threads = $state.raw<TLCommentThread[]>(initial)
		const model = createClusterModel(editor, () => threads)
		flushSync()
		body({
			model,
			setThreads(next) {
				threads = next
				flushSync()
			},
		})
	})
	cleanup()
}

describe('createClusterModel', () => {
	it('builds a model whose leaves are the pinned threads on the current page', () => {
		const editor = makeEditor()
		const a = threadAt(editor, 0, 0)
		const b = threadAt(editor, 5000, 5000)
		withModel(editor, [a, b], ({ model }) => {
			expect(model.model.table.leaves.map((leaf) => leaf.id).sort()).toEqual([a.id, b.id].sort())
			expect(model.orphanThreads).toEqual([])
			expect(model.heldThreads).toEqual([])
			// Far apart at the default zoom: both are drawn individually.
			expect(model.fadeNodes.map((n) => n.node.count)).toEqual([1, 1])
			expect(model.fadeNodes.every((n) => n.phase === 'present')).toBe(true)
		})
	})

	it('shows a newly added thread as an orphan until the next zoom-out adopts the rebuild', () => {
		const editor = makeEditor()
		const a = threadAt(editor, 0, 0)
		const b = threadAt(editor, 5000, 5000)
		withModel(editor, [a], ({ model, setThreads }) => {
			const rendered = model.model
			setThreads([a, b])
			// The on-screen partition holds still; the new pin renders on its own.
			expect(model.model).toBe(rendered)
			expect(model.orphanThreads.map((t) => t.id)).toEqual([b.id])
			// Zooming out adopts the corrected rebuild.
			editor.setCamera({ x: 0, y: 0, z: editor.getZoomLevel() / 2 })
			flushSync()
			expect(model.model).not.toBe(rendered)
			expect(model.orphanThreads).toEqual([])
		})
	})

	it('detaches a thread that left the input from its badge in place', () => {
		const editor = makeEditor()
		const a = threadAt(editor, 0, 0)
		const b = threadAt(editor, 5000, 5000)
		withModel(editor, [a, b], ({ model, setThreads }) => {
			const rendered = model.model
			setThreads([a])
			expect(model.model).toBe(rendered)
			const visibleMembers = [...model.model.runtime.getVisible().values()].flatMap(
				(n) => n.members
			)
			expect(visibleMembers).toEqual([a.id])
		})
	})
})
