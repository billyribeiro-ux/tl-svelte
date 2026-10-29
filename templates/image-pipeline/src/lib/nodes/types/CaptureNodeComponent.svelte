<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import {
		NODE_FOOTER_HEIGHT_PX,
		NODE_HEADER_HEIGHT_PX,
		NODE_ROW_BOTTOM_PADDING_PX,
		NODE_ROW_HEADER_GAP_PX,
	} from '../../constants'
	import type { CaptureNode } from './CaptureNode'
	import type { NodeComponentProps } from './shared'

	let { shape }: NodeComponentProps<CaptureNode> = $props()

	const editor = getEditor()
	const geometry = $derived(fromComputed('geometry', () => editor.getShapeGeometry(shape.id)))
	const bounds = $derived(geometry.current.bounds)
</script>

<div
	class="CaptureNode-body"
	style:width="{bounds.w}px"
	style:height="{bounds.h -
		NODE_HEADER_HEIGHT_PX -
		NODE_ROW_HEADER_GAP_PX -
		NODE_ROW_BOTTOM_PADDING_PX -
		NODE_FOOTER_HEIGHT_PX}px"
></div>
