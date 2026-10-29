import { createShapeId, type TLEmbedShape } from '@svelte-draw/editor'
import { TestEditor } from '../../../test/TestEditor'
import BookmarkShapeComponent from '../bookmark/BookmarkShapeComponent.svelte'
import ImageShape from '../image/ImageShape.svelte'
import VideoShape from '../video/VideoShape.svelte'
import { getGistSrcDoc, getSandboxPermissions } from './embedHelpers'
import EmbedShape from './EmbedShape.svelte'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})

afterEach(() => {
	editor?.dispose()
})

describe('media shape utils return shape views', () => {
	it('embed', () => {
		const id = createShapeId('e')
		editor.createShape({ id, type: 'embed', props: { url: 'https://example.com' } })
		const shape = editor.getShape<TLEmbedShape>(id)!
		const view = editor.getShapeUtil(shape).component(shape) as any
		expect(view.component).toBe(EmbedShape)
		expect(view.props.shape).toBe(shape)
		expect(view.props.util).toBe(editor.getShapeUtil(shape))
	})

	it('image', () => {
		const id = createShapeId('i')
		editor.createShape({ id, type: 'image' })
		const shape = editor.getShape(id)!
		const view = editor.getShapeUtil(shape).component(shape) as any
		expect(view.component).toBe(ImageShape)
	})

	it('video', () => {
		const id = createShapeId('v')
		editor.createShape({ id, type: 'video' })
		const shape = editor.getShape(id)!
		const view = editor.getShapeUtil(shape).component(shape) as any
		expect(view.component).toBe(VideoShape)
	})

	it('bookmark', () => {
		const id = createShapeId('b')
		editor.createShape({ id, type: 'bookmark', props: { url: 'https://example.com' } })
		const shape = editor.getShape(id)!
		const view = editor.getShapeUtil(shape).component(shape) as any
		expect(view.component).toBe(BookmarkShapeComponent)
		expect(view.props).toMatchObject({ url: 'https://example.com', assetId: null, rotation: 0 })
	})

	it('image/video toSvg return null without an asset', async () => {
		for (const type of ['image', 'video'] as const) {
			const id = createShapeId(type)
			editor.createShape({ id, type })
			const shape = editor.getShape(id)!
			expect(await (editor.getShapeUtil(shape) as any).toSvg(shape, {})).toBeNull()
		}
	})
})

describe('embed helpers', () => {
	it('joins only enabled sandbox permissions', () => {
		expect(
			getSandboxPermissions({ 'allow-scripts': true, 'allow-forms': false, 'allow-popups': true })
		).toBe('allow-scripts allow-popups')
	})

	it('builds the gist srcdoc around the gist script url', () => {
		const doc = getGistSrcDoc('abc123')
		expect(doc).toContain('<script src=https://gist.github.com/abc123.js></script>')
		expect(doc).toContain('<base target="_blank">')
	})
})
