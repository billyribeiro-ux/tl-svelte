<script lang="ts">
	import { Box, getEditor, type TLImageExportOptions } from 'svelte-draw'
	import Control from './Control.svelte'

	const editor = getEditor()

	// [1]
	let opts = $state<TLImageExportOptions>({
		scale: 1,
		background: false,
		padding: editor.options.defaultSvgPadding,
	})

	// [2]
	let box = $state(
		(() => {
			const v = editor.getViewportPageBounds()
			return { x: Math.round(v.x), y: Math.round(v.y), w: Math.round(v.w), h: Math.round(v.h) }
		})()
	)

	const boxKeys = ['x', 'y', 'w', 'h'] as const

	async function exportCanvas() {
		const shapeIds = editor.getCurrentPageShapeIds()
		if (shapeIds.size === 0) return alert('No shapes on the canvas')

		// [3]
		const { blob } = await editor.toImage([...shapeIds], {
			format: 'png',
			...$state.snapshot(opts),
			bounds: box.w > 0 && box.h > 0 ? new Box(box.x, box.y, box.w, box.h) : undefined,
		})

		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = 'every-shape-on-the-canvas.png'
		link.click()
		URL.revokeObjectURL(link.href)
	}
</script>

<div
	style="pointer-events: all; border: 1px solid black; border-radius: 5px; padding: 12px; position: absolute; display: flex; flex-direction: column; right: 164px; top: 8px"
>
	<div
		style="display: grid; grid-template-columns: 1fr auto; grid-auto-flow: row; row-gap: 4px; column-gap: 16px"
	>
		<Control
			type="checkbox"
			name="background"
			checked={opts.background}
			onchange={(e) => {
				opts.background = e.currentTarget.checked
			}}
		/>
		<Control
			type="checkbox"
			name="darkmode"
			checked={opts.darkMode}
			onchange={(e) => {
				opts.darkMode = e.currentTarget.checked
			}}
		/>
		<Control
			type="number"
			name="padding"
			value={opts.padding}
			onchange={(e) => {
				opts.padding = Math.ceil(Number(e.currentTarget.value))
			}}
		/>
		<Control
			type="number"
			name="scale"
			value={opts.scale}
			onchange={(e) => {
				opts.scale = Math.ceil(Number(e.currentTarget.value))
			}}
		/>
		<p style="grid-column: 1 / span 2">Box</p>
		{#each boxKeys as key (key)}
			<div style="display: flex; gap: 4px">
				<Control
					type="number"
					name={key}
					value={box[key]}
					onchange={(event) => {
						box[key] = Math.ceil(Number(event.currentTarget.value))
					}}
				/>
			</div>
		{/each}
	</div>
	<button style="pointer-events: all; margin-top: 16px" onclick={exportCanvas}>
		Export canvas as image
	</button>
</div>

<!--
[1]
`TLImageExportOptions` controls the export. The built-in export and copy actions fill
these from user preferences (e.g. `editor.user.getIsDarkMode()`), but when you call
`toImage` yourself you choose. `padding` accepts a number of pixels or 'auto', which
trims to the visual bounds of the content; the default here matches
`editor.options.defaultSvgPadding`.

[2]
`bounds` crops the export to a page-space box instead of fitting the shapes. It starts
as the current viewport so the first export matches what you see.

[3]
A box with zero width or height is treated as "no bounds", so the export fits all
shapes.
-->
