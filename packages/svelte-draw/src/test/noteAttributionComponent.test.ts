import {
	Editor,
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
import {
	act,
	renderSvelteDraw,
	type RenderedSvelteDraw,
} from './testutils/renderSvelteDrawComponent'

const noteId = createShapeId('note1')

// A minimal user store with a known signed-in user, so the note has a display name to attribute.
const currentUser = UserRecordType.create({ id: createUserId('alice'), name: 'Alice Mertnet' })
const users: TLUserStore = {
	currentUser: computed('currentUser', () => currentUser),
	resolve: (userId) => computed('resolve', () => (userId === 'alice' ? currentUser : null)),
}

// Create a note and type into it so that `textLastEditedBy` gets stamped with the current user,
// which is what makes the attribution badge render.
async function createAttributedNote(editor: Editor) {
	await act(() => {
		editor.createShapes([{ id: noteId, type: 'note', x: 0, y: 0 }])
		editor.updateShape<TLNoteShape>({
			id: noteId,
			type: 'note',
			props: { richText: toRichText('Hello') },
		})
	})
}

const renders: RenderedSvelteDraw[] = []

afterEach(() => {
	for (const r of renders.splice(0)) {
		r.editor.dispose()
		r.unmount()
	}
})

// Pass `attribution` to configure the note shape util's `AttributionComponent` option; omit it to use
// the default badge.
async function setup(attribution?: { AttributionComponent: TLNoteShapeAttributionComponent }) {
	const shapeUtils = attribution ? [NoteShapeUtil.configure(attribution)] : undefined
	const rendered = await renderSvelteDraw({ users, shapeUtils })
	renders.push(rendered)
	return { editor: rendered.editor, rendered }
}

describe('NoteShapeAttribution component', () => {
	it('renders the default attribution badge', async () => {
		const { editor, rendered } = await setup()
		await createAttributedNote(editor)
		// the user store should resolve a display name for the last editor
		expect(editor.getAttributionDisplayName(editor.getAttributionUserId())).toBe('Alice Mertnet')

		await vi.waitFor(() => {
			const badge = rendered.target.querySelector('.tl-note__attribution')
			expect(badge).not.toBeNull()
			expect(badge?.textContent).toBe('Alice')
		})
	})

	it('renders a custom NoteShapeAttribution component', async () => {
		const { editor, rendered } = await setup({ AttributionComponent: CustomNoteAttribution })
		await createAttributedNote(editor)

		const badge = await rendered.findByTestId('custom-attribution')
		expect(badge.textContent).toBe('custom: Alice')
		// the default badge markup should not be present
		expect(rendered.target.querySelector('.tl-note__attribution')).toBeNull()
	})

	it('hides the attribution badge when AttributionComponent is null', async () => {
		const { editor, rendered } = await setup({ AttributionComponent: null })
		await createAttributedNote(editor)

		// the note itself should render...
		await vi.waitFor(() => {
			expect(rendered.target.querySelector('.tl-note__container')).not.toBeNull()
		})
		// ...but the attribution badge should not.
		expect(rendered.target.querySelector('.tl-note__attribution')).toBeNull()
	})
})
