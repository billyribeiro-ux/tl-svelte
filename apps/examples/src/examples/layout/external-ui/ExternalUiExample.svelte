<script lang="ts">
	import { type Editor, fromComputed, GeoShapeGeoStyle, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './external-ui.css'

	// There's a guide at the bottom of this file!

	// [1]
	let editor = $state.raw<Editor | null>(null)

	// Editor getters are signals, so read them through `fromComputed` for the template to update.
	const currentToolId = $derived.by(() => {
		const e = editor
		return e ? fromComputed('current tool id', () => e.getCurrentToolId()) : null
	})
	const isOvalStyle = $derived.by(() => {
		const e = editor
		return e
			? fromComputed('oval style', () => e.getStyleForNextShape(GeoShapeGeoStyle) === 'oval')
			: null
	})
</script>

<div style="margin: 32px; width: 600px;">
	<div style="height: 400px;">
		<!-- [2] -->
		<SvelteDraw onMount={(e) => {
			editor = e
		}} components={{ Toolbar: null }} />
	</div>
	<!-- [3] -->
	<div>
		<div class="external-toolbar">
			<button
				class="external-button"
				data-isactive={currentToolId?.current === 'select'}
				onclick={() => editor?.setCurrentTool('select')}
			>
				Select
			</button>
			<button
				class="external-button"
				data-isactive={currentToolId?.current === 'draw'}
				onclick={() => editor?.setCurrentTool('draw')}
			>
				Pencil
			</button>
			<button
				class="external-button"
				data-isactive={currentToolId?.current === 'geo' && isOvalStyle?.current === true}
				onclick={() => {
					const e = editor
					if (!e) return
					e.run(() => {
						// [4]
						e.setStyleForNextShapes(GeoShapeGeoStyle, 'oval')
						e.setCurrentTool('geo')
					})
				}}
			>
				Oval
			</button>
		</div>
	</div>
</div>

<!--
[1]
Components outside `SvelteDraw` can't use `getEditor()`, so we hold the editor in state
instead. It's null until the editor mounts.

[2]
Use the `onMount` prop to get the editor instance and store it in state.

[3]
Read from the editor with `fromComputed` (so the active button updates when the tool
changes) and call its methods to control it. The callbacks guard against the editor
not being mounted yet.

[4]
The geo tool creates whichever geo shape is set in `GeoShapeGeoStyle` (oval,
rectangle, etc), so set the style first, then switch tools. `editor.run` batches the
two updates together.
-->
