import { AssetRecordType, Editor, type TLAssetId } from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AssetProbeHost from '../../../test/svelte/AssetProbeHost.svelte'
import { createTestEditor, flush } from '../../../test/svelte/helpers'

let editor: Editor
let container: HTMLElement
let disposeEditor: () => void
let component: ReturnType<typeof mount> | undefined
const assetId = AssetRecordType.createId('image')
const otherAssetId = AssetRecordType.createId('image2')

function imageAsset(id: TLAssetId, w: number, src = 'http://localhost/image.png') {
	return {
		id,
		type: 'image' as const,
		typeName: 'asset' as const,
		props: {
			w,
			h: 100,
			name: 'image.png',
			isAnimated: false,
			mimeType: 'image/png',
			src,
		},
		meta: {},
	}
}

beforeEach(() => {
	const test = createTestEditor()
	editor = test.editor
	container = test.container
	disposeEditor = test.dispose
	editor.createAssets([imageAsset(assetId, 100)])
})

afterEach(() => {
	if (component) unmount(component)
	component = undefined
	disposeEditor()
	vi.restoreAllMocks()
})

/** Mounts the hook; `props.assetId` can be reassigned like `rerender` in the React test. */
function renderAssetHook(initialAssetId: TLAssetId | null) {
	const options = $state({ assetId: initialAssetId as TLAssetId | null, width: 100 })
	const sink: { read?(): { asset: any; url: string | null } } = {}
	component = mount(AssetProbeHost, {
		target: container,
		props: { editor, container, options, sink },
	})
	flushSync()
	return {
		get current() {
			return sink.read!()
		},
		rerender(next: { assetId: TLAssetId | null }) {
			options.assetId = next.assetId
			flushSync()
		},
	}
}

it('clears the resolved asset when the assetId is removed, and resolves it again when re-attached', async () => {
	const result = renderAssetHook(assetId)
	await flush()
	expect(result.current).toMatchObject({
		url: 'http://localhost/image.png',
		asset: { id: assetId },
	})

	result.rerender({ assetId: null })
	await flush()
	expect(result.current).toMatchObject({ url: null, asset: null })

	result.rerender({ assetId })
	await flush()
	expect(result.current).toMatchObject({
		url: 'http://localhost/image.png',
		asset: { id: assetId },
	})
})

it('resolves the asset again when its record is deleted and recreated', async () => {
	const result = renderAssetHook(assetId)
	await flush()
	expect(result.current).toMatchObject({
		url: 'http://localhost/image.png',
		asset: { id: assetId },
	})

	editor.deleteAssets([assetId])
	await flush()
	expect(result.current).toMatchObject({ url: null, asset: null })

	editor.createAssets([imageAsset(assetId, 100)])
	await flush()
	expect(result.current).toMatchObject({
		url: 'http://localhost/image.png',
		asset: { id: assetId },
	})
})

it('returns the new asset when switching to one that resolves to the same url', async () => {
	editor.createAssets([imageAsset(otherAssetId, 200)])
	const result = renderAssetHook(assetId)
	await flush()
	expect(result.current.asset).toMatchObject({ id: assetId, props: { w: 100 } })

	result.rerender({ assetId: otherAssetId })
	await flush()
	expect(result.current).toMatchObject({
		url: 'http://localhost/image.png',
		asset: { id: otherAssetId, props: { w: 200 } },
	})
})

it('shows the new asset, not the old one, when switching to an asset that has no url yet', async () => {
	// Like the dotcom asset stores, resolve an asset without a src to null rather than ''
	const resolve = editor.resolveAssetUrl.bind(editor)
	vi.spyOn(editor, 'resolveAssetUrl').mockImplementation(
		async (id, ctx) => (await resolve(id, ctx)) || null
	)
	editor.createAssets([imageAsset(otherAssetId, 200, '')])
	const result = renderAssetHook(assetId)
	await flush()
	expect(result.current).toMatchObject({
		url: 'http://localhost/image.png',
		asset: { id: assetId },
	})

	result.rerender({ assetId: otherAssetId })
	await flush()
	expect(result.current).toMatchObject({ url: null, asset: { id: otherAssetId } })
})

it('ignores a resolution that was still in flight when the asset record was deleted', async () => {
	const result = renderAssetHook(assetId)
	await flush()
	expect(result.current).toMatchObject({
		url: 'http://localhost/image.png',
		asset: { id: assetId },
	})

	let finishResolving!: (url: string) => void
	vi.spyOn(editor, 'resolveAssetUrl').mockImplementation(
		() => new Promise<string>((resolve) => (finishResolving = resolve))
	)
	// Zoom triggers a debounced re-resolution; drive the debounce with ticks until it fires
	editor.setCamera({ x: 0, y: 0, z: 2 })
	for (let i = 0; i < 40; i++) editor.emit('tick', 16)
	await flush()
	expect(editor.resolveAssetUrl).toHaveBeenCalled()

	editor.deleteAssets([assetId])
	await flush()
	expect(result.current).toMatchObject({ url: null, asset: null })

	finishResolving('http://localhost/image.png')
	await flush()
	expect(result.current).toMatchObject({ url: null, asset: null })
})
