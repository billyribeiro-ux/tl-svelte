import {
	type TLNoteShape,
	type TLUserStore,
	UserRecordType,
	computed,
	createShapeId,
	createUserId,
	toRichText,
} from '@svelte-draw/editor'
import { vi } from 'vitest'
import type { TLNoteShapeAttributionComponent } from '../lib/shapes/note/DefaultNoteShapeAttribution.svelte'
import { NoteShapeUtil } from '../lib/shapes/note/NoteShapeUtil'
import CustomNoteAttribution from './svelte/CustomNoteAttribution.svelte'
import { TestEditor } from './TestEditor'

vi.useRealTimers()

const noteId = createShapeId('note1')
const currentUser = UserRecordType.create({ id: createUserId('alice'), name: 'Alice Mertnet' })
const users: TLUserStore = {
	currentUser: computed('currentUser', () => currentUser),
	resolve: (userId) => computed('resolve', () => (userId === 'alice' ? currentUser : null)),
}

// Build an editor with an attributed note. Pass `attribution` to configure the note shape util's
// `AttributionComponent` option; omit it to use the default badge.
function makeEditor(attribution?: { AttributionComponent: TLNoteShapeAttributionComponent }) {
	const editor = new TestEditor(
		attribution ? { shapeUtils: [NoteShapeUtil.configure(attribution)] } : {},
		{ users }
	)
	editor.createShapes([{ id: noteId, type: 'note', x: 0, y: 0 }])
	editor.updateShape<TLNoteShape>({
		id: noteId,
		type: 'note',
		props: { richText: toRichText('Hello') },
	})
	return editor
}

let editor: TestEditor

afterEach(() => {
	editor?.dispose()
})

describe('note attribution in SVG export', () => {
	it('renders the default attribution badge in exports', async () => {
		editor = makeEditor()
		const result = await editor.getSvgString([noteId])
		expect(result!.svg).toContain('tl-note__attribution')
		expect(result!.svg).toContain('Alice')
	})

	it('omits the attribution badge when AttributionComponent is null', async () => {
		editor = makeEditor({ AttributionComponent: null })
		const result = await editor.getSvgString([noteId])
		expect(result!.svg).not.toContain('tl-note__attribution')
	})

	it('renders a custom attribution component in exports', async () => {
		editor = makeEditor({
			AttributionComponent: CustomNoteAttribution,
		})
		const result = await editor.getSvgString([noteId])
		expect(result!.svg).toContain('custom: Alice')
	})
})
