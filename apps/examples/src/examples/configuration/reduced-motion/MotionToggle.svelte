<script lang="ts">
	import { SvelteDrawUiButton, getEditor, usePrefersReducedMotion } from 'svelte-draw'

	// [4]
	const editor = getEditor()
	const prefersReducedMotion = usePrefersReducedMotion()

	const toggleMotion = () => {
		const currentSpeed = editor.user.getAnimationSpeed()
		editor.user.updateUserPreferences({
			animationSpeed: currentSpeed === 0 ? 1 : 0,
		})
	}
</script>

<div class="tlui-menu motion-toggle">
	<span class="motion-toggle__label">
		Motion: {prefersReducedMotion.current ? 'Reduced' : 'Normal'}
	</span>
	<SvelteDrawUiButton type="primary" onclick={toggleMotion}>Toggle</SvelteDrawUiButton>
</div>
