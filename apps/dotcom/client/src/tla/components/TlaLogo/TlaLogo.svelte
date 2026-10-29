<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	import styles from './logo.module.css'

	const LOGO_MASK = `url(/svelte-draw_sidebar_logo.svg) center 100% / 100% no-repeat`

	let { class: className, style, ...props }: HTMLAttributes<HTMLSpanElement> = $props()

	function applyWebkitMask(element: HTMLElement) {
		element.style.setProperty('-webkit-mask', LOGO_MASK)
	}
</script>

<span
	role="img"
	{...props}
	{@attach applyWebkitMask}
	style={`mask: ${LOGO_MASK}${typeof style === 'string' && style ? `; ${style}` : ''}`}
	aria-label="svelte-draw"
	class={[styles.logo, className]}
></span>
