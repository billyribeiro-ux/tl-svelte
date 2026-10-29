<script lang="ts">
	import { approximately, fromComputed, getEditor, type TLGridProps } from 'svelte-draw'

	import type { Attachment } from 'svelte/attachments'

	let { size, ...camera }: TLGridProps = $props()

	const editor = getEditor()

	// [2]
	const screenBounds = fromComputed('screenBounds', () => editor.getViewportScreenBounds())
	const devicePixelRatio = fromComputed('dpr', () => editor.getInstanceState().devicePixelRatio)
	const colorMode = fromComputed('colorMode', () => editor.getColorMode())

	function drawLine(
		ctx: CanvasRenderingContext2D,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		width: number
	) {
		ctx.beginPath()
		ctx.moveTo(x1, y1)
		ctx.lineTo(x2, y2)
		ctx.lineWidth = width
		ctx.stroke()
	}

	// An attachment re-runs whenever the state it reads changes, like the React `useLayoutEffect`
	// (with its dependency list) it replaces.
	const drawGrid: Attachment<HTMLCanvasElement> = (canvas) => {
		const dpr = devicePixelRatio.current
		const isDarkMode = colorMode.current === 'dark'
		const { x, y, z } = camera
		// [3]
		const canvasW = screenBounds.current.w * dpr
		const canvasH = screenBounds.current.h * dpr
		canvas.width = canvasW
		canvas.height = canvasH

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		ctx.clearRect(0, 0, canvasW, canvasH)

		// [4]
		const pageViewportBounds = editor.getViewportPageBounds()

		const startPageX = Math.ceil(pageViewportBounds.minX / size) * size
		const startPageY = Math.ceil(pageViewportBounds.minY / size) * size
		const endPageX = Math.floor(pageViewportBounds.maxX / size) * size
		const endPageY = Math.floor(pageViewportBounds.maxY / size) * size
		const numRows = Math.round((endPageY - startPageY) / size)
		const numCols = Math.round((endPageX - startPageX) / size)

		ctx.strokeStyle = isDarkMode ? '#555' : '#BBB'

		// [5]
		for (let row = 0; row <= numRows; row++) {
			const pageY = startPageY + row * size
			// convert the page-space Y offset into our canvas' coordinate space
			const canvasY = (pageY + y) * z * dpr
			const isMajorLine = approximately(pageY % (size * 10), 0)
			drawLine(ctx, 0, canvasY, canvasW, canvasY, isMajorLine ? 3 : 1)
		}
		for (let col = 0; col <= numCols; col++) {
			const pageX = startPageX + col * size
			// convert the page-space X offset into our canvas' coordinate space
			const canvasX = (pageX + x) * z * dpr
			const isMajorLine = approximately(pageX % (size * 10), 0)
			drawLine(ctx, canvasX, 0, canvasX, canvasH, isMajorLine ? 3 : 1)
		}
	}
</script>

<!-- [6] -->
<canvas class="tl-grid" {@attach drawGrid}></canvas>
