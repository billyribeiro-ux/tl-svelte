import { BaseBoxShapeTool } from 'svelte-draw'

export class SlideShapeTool extends BaseBoxShapeTool {
	static override id = 'slide'
	static override initial = 'idle'
	override shapeType = 'slide' as const
}
