<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './reduced-motion.css'
	import MotionToggle from './MotionToggle.svelte'
	import { PULSE_SHAPE_TYPE, PulseShapeUtil } from './PulseShapeUtil'

	const components: TLComponents = {
		TopPanel: MotionToggle,
	}

	const shapeUtils = [PulseShapeUtil]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{shapeUtils}
		{components}
		onMount={(editor) => {
			editor.createShape({ type: PULSE_SHAPE_TYPE, x: 200, y: 200 })
			editor.createShape({ type: PULSE_SHAPE_TYPE, x: 450, y: 200 })
			editor.createShape({ type: PULSE_SHAPE_TYPE, x: 325, y: 450 })
		}}
	/>
</div>

<!--
[1]
Registering the props in TLGlobalShapePropsMap (PulseShapeUtil.ts) is what makes
`editor.createShape({ type })` type-check and gives `TLShape<'pulse-shape'>` its props type.

[2]
`usePrefersReducedMotion()` (PulseShape.svelte) returns true when the user's svelte-draw preference
has `animationSpeed` set to 0, or (if no preference is set) when the OS reports
`prefers-reduced-motion: reduce`. It is read in a Svelte component that `component()` returns as a
`shapeView`; the component updates when the preference changes and swaps the CSS class from the
pulsing indicator to the static one.

[3]
The util itself is minimal: geometry, indicator, and the component above.

[4]
The toggle (MotionToggle.svelte) flips the svelte-draw preference with
`editor.user.updateUserPreferences()`. Setting `animationSpeed: 0` is what svelte-draw's own
"reduce motion" preference does, so the hook and every shape using it respond the same way they
would to the built-in setting.
-->
