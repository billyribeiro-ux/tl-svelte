import {
	AssetRecordType,
	DEFAULT_SUPPORTED_IMAGE_TYPES,
	type Editor,
	FileHelpers,
	MediaHelpers,
	StateNode,
	type TLAssetId,
	Vec,
	type VecLike,
	atom,
	uniqueId,
} from 'svelte-draw'

// There's a guide at the bottom of this file!

export const STAMP_SIZE = 64
const STAMP_SPACING = STAMP_SIZE
const PNG_SIZE = 128

// [1]
export type Stamp =
	| { type: 'emoji'; emoji: string }
	| { type: 'image'; id: string; src: string; w: number; h: number; mimeType: string }

export const stampList = atom<Stamp[]>('stamps', [
	{ type: 'emoji', emoji: '👍' },
	{ type: 'emoji', emoji: '❤️' },
	{ type: 'emoji', emoji: '🔥' },
	{ type: 'emoji', emoji: '⭐' },
	{ type: 'emoji', emoji: '😂' },
	{ type: 'emoji', emoji: '🎉' },
])
export const currentStamp = atom<Stamp>('current stamp', stampList.get()[0])

export function getStampId(stamp: Stamp) {
	return stamp.type === 'emoji'
		? 'emoji-' +
				Array.from(stamp.emoji)
					.map((char) => char.codePointAt(0)!.toString(16))
					.join('-')
		: stamp.id
}

// [2]
export class StampTool extends StateNode {
	static override id = 'stamp'

	lastStampPoint = new Vec()

	override onEnter() {
		this.editor.setCursor({ type: 'cross', rotation: 0 })
	}

	override onExit() {
		this.editor.setCursor({ type: 'default', rotation: 0 })
	}

	override onPointerDown() {
		this.editor.markHistoryStoppingPoint('stamping')
		this.stamp()
	}

	// [3]
	override onPointerMove() {
		if (!this.editor.inputs.getIsPointing()) return
		const distance = Vec.Dist(this.editor.inputs.getCurrentPagePoint(), this.lastStampPoint)
		if (distance < STAMP_SPACING) return
		this.stamp()
	}

	override onCancel() {
		this.editor.setCurrentTool('select')
	}

	private stamp() {
		const point = this.editor.inputs.getCurrentPagePoint()
		this.lastStampPoint = Vec.From(point)
		stampAtPoint(this.editor, point, currentStamp.get())
	}
}

function renderEmojiToPng(emoji: string) {
	const canvas = document.createElement('canvas')
	canvas.width = PNG_SIZE
	canvas.height = PNG_SIZE
	const ctx = canvas.getContext('2d')!
	ctx.font = `${PNG_SIZE * 0.8}px sans-serif`
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText(emoji, PNG_SIZE / 2, PNG_SIZE / 2 + PNG_SIZE * 0.05)
	return {
		src: canvas.toDataURL('image/png'),
		w: PNG_SIZE,
		h: PNG_SIZE,
		mimeType: 'image/png',
	}
}

// [4]
function getStampAssetId(editor: Editor, stamp: Stamp): TLAssetId {
	const assetId = AssetRecordType.createId(getStampId(stamp))
	if (editor.getAsset(assetId)) return assetId

	const { src, w, h, mimeType } = stamp.type === 'emoji' ? renderEmojiToPng(stamp.emoji) : stamp

	editor.createAssets([
		{
			id: assetId,
			type: 'image',
			typeName: 'asset',
			props: { name: 'stamp', src, w, h, mimeType, isAnimated: false },
			meta: {},
		},
	])
	return assetId
}

// [5]
function stampAtPoint(editor: Editor, point: VecLike, stamp: Stamp) {
	let w = STAMP_SIZE
	let h = STAMP_SIZE
	if (stamp.type === 'image') {
		const scale = STAMP_SIZE / Math.max(stamp.w, stamp.h)
		w = stamp.w * scale
		h = stamp.h * scale
	}

	editor.run(() => {
		const assetId = getStampAssetId(editor, stamp)
		editor.createShape({
			type: 'image',
			x: point.x - w / 2,
			y: point.y - h / 2,
			props: { assetId, w, h },
		})
	})
}

// [6]
export function uploadStamp(editor: Editor) {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = DEFAULT_SUPPORTED_IMAGE_TYPES.join(',')
	input.addEventListener('change', async (e) => {
		const file = (e.target as HTMLInputElement).files?.[0]
		if (!file) return

		const src = await FileHelpers.blobToDataUrl(file)
		const { w, h } = await MediaHelpers.getImageSize(file)
		const stamp: Stamp = { type: 'image', id: uniqueId(), src, w, h, mimeType: file.type }

		stampList.update((s) => [...s, stamp])
		currentStamp.set(stamp)
		editor.setCurrentTool('stamp')
	})
	input.click()
}

/*
This example shows how to build a stamp tool: pick a stamp from a panel, then
click the canvas to place it, or hold and drag to lay down a trail of stamps.
Each stamp is placed as an image shape — emoji stamps are rendered to a PNG,
and you can also upload your own image to use as a stamp.

[1]
Stamps are plain data held in an `atom` from svelte-draw's signals library: either
an emoji, or an uploaded image with a data URL source. This is the extension
point — to ship a new default stamp, add an entry to the array. Because the
panel (StampPanel.svelte) reads the atom through `fromSignal`, stamps added at runtime
(see [6]) show up automatically.

[2]
The stamp tool is a `StateNode`, the same state machine primitive svelte-draw's own
tools are built from. It sets a crosshair cursor while active and stamps at
the click point on pointer down. The tool stays active after stamping so you
can stamp repeatedly; pressing Escape cancels back to the select tool.

[3]
Dragging stamps a trail: on each pointer move while pointing, the tool places
the next stamp once the pointer has travelled far enough from the last one.
Distance is measured in page space, so trail density stays consistent at any
zoom level. The history stopping point is marked once on pointer down, so a
whole drag is a single undo step.

[4]
Every stamp becomes a shared image asset, created once via
`editor.createAssets`. Emoji are drawn to a PNG with a canvas element, so
stamps look identical in exports and for collaborators regardless of platform
emoji fonts. The asset id is derived from the stamp's id, so stamping the
same stamp twice reuses one asset.

[5]
Stamping creates an image shape centered on the pointer, linked to the asset.
Uploaded images are scaled to fit the stamp size while keeping their aspect
ratio.

[6]
The upload button opens a file picker and adds the chosen image as a new
stamp option. The image is stored as a data URL so stamps survive in the
document; the new stamp is selected and the tool activated right away.

[7]
(StampPanel.svelte) The picker panel goes in the `TopPanel` component slot. Clicking a stamp sets
the current stamp atom and switches to the stamp tool. The active stamp is
highlighted by checking `editor.getCurrentToolId()`.
*/
