<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setSvelteDrawUiOrientation } from './layout.svelte'

	/** @public */
	interface Props {
		children?: Snippet
		orientation: 'horizontal' | 'vertical'
		tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
	}

	let { children, orientation, tooltipSide }: Props = $props()

	setSvelteDrawUiOrientation(
		() => orientation,
		() => tooltipSide
	)
</script>

{@render children?.()}
