<script lang="ts">
	import { EASINGS, fromComputed, getEditor, SvelteDrawUiButton } from 'svelte-draw'

	const editor = getEditor()

	// [1]
	const animatePosition = () => {
		const shape = editor.getOnlySelectedShape()
		if (!shape) return

		editor.animateShape(
			{ ...shape, x: shape.x + 200, y: shape.y + 100 },
			{ animation: { duration: 800, easing: EASINGS.easeInOutCubic } }
		)
	}

	const animateRotation = () => {
		const shape = editor.getOnlySelectedShape()
		if (!shape) return

		editor.animateShape(
			{ ...shape, rotation: shape.rotation + Math.PI * 2 },
			{ animation: { duration: 1000, easing: EASINGS.easeInOutCubic } }
		)
	}

	const animateFade = () => {
		const shape = editor.getOnlySelectedShape()
		if (!shape) return

		editor.animateShape(
			{ ...shape, opacity: shape.opacity > 0.5 ? 0.2 : 1 },
			{ animation: { duration: 600, easing: EASINGS.easeInOutQuad } }
		)
	}

	const animateAll = () => {
		const shape = editor.getOnlySelectedShape()
		if (!shape) return

		editor.animateShape(
			{
				...shape,
				x: shape.x + 150,
				y: shape.y - 100,
				rotation: shape.rotation + Math.PI,
				opacity: 0.3,
			},
			{ animation: { duration: 1200, easing: EASINGS.easeInOutCubic } }
		)
	}

	// [2]
	const animateMultiple = () => {
		const updates = editor.getCurrentPageShapes().map((shape) => ({
			...shape,
			x: shape.x + (Math.random() - 0.5) * 200,
			y: shape.y + (Math.random() - 0.5) * 200,
			rotation: shape.rotation + (Math.random() - 0.5) * Math.PI,
		}))

		editor.animateShapes(updates, { animation: { duration: 1000, easing: EASINGS.easeOutCubic } })
	}

	const hasOneSelected = fromComputed(
		'has one selected',
		() => editor.getSelectedShapeIds().length === 1
	)
</script>

<div class="tlui-menu animation-controls">
	<SvelteDrawUiButton type="normal" disabled={!hasOneSelected.current} onclick={animatePosition}>
		Animate position
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" disabled={!hasOneSelected.current} onclick={animateRotation}>
		Animate rotation
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" disabled={!hasOneSelected.current} onclick={animateFade}>
		Fade in/out
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" disabled={!hasOneSelected.current} onclick={animateAll}>
		Animate all
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={animateMultiple}>
		Animate multiple shapes
	</SvelteDrawUiButton>
</div>
