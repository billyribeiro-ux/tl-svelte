<script lang="ts">
	import { HTMLContainer, usePrefersReducedMotion } from 'svelte-draw'

	// [2]
	const prefersReducedMotion = usePrefersReducedMotion()
</script>

<HTMLContainer class="pulse-shape">
	<div class="pulse-shape__content">
		<div class={prefersReducedMotion.current ? 'pulse-indicator--static' : 'pulse-indicator'}></div>
		<div class="pulse-shape__label">
			{prefersReducedMotion.current ? 'Static mode' : 'Animated mode'}
		</div>
	</div>
</HTMLContainer>
