import { atom, StateNode, toRichText, type TLTextShape } from 'svelte-draw'

const OFFSET = 12

// [1]
export class HeartTool extends StateNode {
	static override id = 'heart'

	override onEnter() {
		this.editor.setCursor({ type: 'cross', rotation: 0 })
	}

	override onPointerDown() {
		const currentPagePoint = this.editor.inputs.getCurrentPagePoint()
		this.editor.createShape<TLTextShape>({
			type: 'text',
			x: currentPagePoint.x - OFFSET,
			y: currentPagePoint.y - OFFSET,
			props: { richText: toRichText('❤️') },
		})
	}
}

// [2]
export const isHeartToolEnabled$ = atom('isHeartToolEnabled', false)
