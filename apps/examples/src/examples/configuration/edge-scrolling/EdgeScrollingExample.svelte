<script lang="ts" module>
	// There's a guide at the bottom of this file!

	// [1]
	interface EdgeScrollValues {
		edgeScrollSpeed: number
		edgeScrollDelay: number
		edgeScrollEaseDuration: number
		edgeScrollDistance: number
	}

	const DEFAULTS: EdgeScrollValues = {
		edgeScrollSpeed: 25,
		edgeScrollDelay: 200,
		edgeScrollEaseDuration: 200,
		edgeScrollDistance: 8,
	}

	const CONTROLS = [
		{ key: 'edgeScrollSpeed', label: 'Speed (px per tick)', min: 0, max: 100, step: 5 },
		{ key: 'edgeScrollDelay', label: 'Delay (ms)', min: 0, max: 1000, step: 50 },
		{ key: 'edgeScrollEaseDuration', label: 'Ease duration (ms)', min: 0, max: 1000, step: 50 },
		{ key: 'edgeScrollDistance', label: 'Edge zone size (px)', min: 0, max: 240, step: 8 },
	] as const
</script>

<script lang="ts">
	import { SvelteDraw, toRichText, type Editor, type TLGeoShape } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './edge-scrolling.css'

	function createDemoShapes(editor: Editor) {
		// changing the options prop recreates the editor but keeps the store, so
		// only create the demo shapes on the first mount
		if (editor.getCurrentPageShapeIds().size > 0) return

		editor.createShape({
			type: 'text',
			x: 120,
			y: 80,
			props: {
				richText: toRichText('Drag a shape toward the edge of the window to edge scroll'),
			},
		})
		const colors = ['blue', 'orange', 'green'] as const
		colors.forEach((color, i) => {
			editor.createShape<TLGeoShape>({
				type: 'geo',
				x: 150 + i * 220,
				y: 200,
				props: { w: 140, h: 140, fill: 'solid', color },
			})
		})
	}

	// `values` is what the editor is built with; `pending` is what the sliders show.
	let values = $state.raw<EdgeScrollValues>(DEFAULTS)
	let pending = $state.raw<EdgeScrollValues>(DEFAULTS)

	function onCommit(next: EdgeScrollValues) {
		values = next
	}

	// read the slider's value from the DOM at commit time so the commit
	// can't lag behind the last change event
	function commit(key: (typeof CONTROLS)[number]['key'], input: HTMLInputElement) {
		onCommit({ ...pending, [key]: Number(input.value) })
	}
</script>

<div class="svelte-draw__editor edge-scrolling">
	<!-- [3] -->
	<SvelteDraw options={values} onMount={createDemoShapes} />
	<!-- [2] -->
	<div class="edge-scrolling__panel">
		<div class="edge-scrolling__title">Edge scrolling options</div>
		{#each CONTROLS as control (control.key)}
			<label class="edge-scrolling__row">
				<span>
					{control.label}: <b>{pending[control.key]}</b>
				</span>
				<input
					type="range"
					min={control.min}
					max={control.max}
					step={control.step}
					value={pending[control.key]}
					oninput={(e) => {
						pending = { ...pending, [control.key]: Number(e.currentTarget.value) }
					}}
					onpointerup={(e) => commit(control.key, e.currentTarget)}
					onkeyup={(e) => commit(control.key, e.currentTarget)}
					onblur={(e) => commit(control.key, e.currentTarget)}
				/>
			</label>
		{/each}
		<button
			class="edge-scrolling__reset"
			onclick={() => {
				pending = DEFAULTS
				onCommit(DEFAULTS)
			}}
		>
			Reset to defaults
		</button>
	</div>
</div>

<!--
[1]
Edge scrolling is configured through four editor options:

- edgeScrollSpeed: the base scroll speed in pixels per tick (default 25).
  The speed also scales with how close the pointer is to the edge, and is
  reduced on small screens.
- edgeScrollDelay: how long (ms) the pointer must stay near the edge before
  scrolling starts (default 200). Raising it prevents accidental scrolls.
- edgeScrollEaseDuration: how long (ms) the scroll takes to accelerate from
  zero to full speed once it starts (default 200).
- edgeScrollDistance: the width in pixels of the edge zone that triggers
  scrolling (default 8). Pointer positions outside the window scroll at full
  speed. Try a large zone (200+): since you grab a shape near its middle,
  scrolling then kicks in as soon as the shape itself touches the window
  edge, rather than waiting for the pointer to get there.

[2]
The sliders commit when you release them rather than while you drag.
That's because editor options are read once when the editor instance is
created: changing the options prop tears down and recreates the editor, so
we don't want to do it dozens of times per second mid-drag. Commits fire on
pointer release, key release (so keyboard adjustment works too), and blur —
re-committing an unchanged value is harmless, since the SvelteDraw component
shallow-compares its options.

[3]
Options are passed via the SvelteDraw component's options prop. Any option from
SvelteDrawOptions can be overridden this way; unspecified options keep their
defaults.
-->
