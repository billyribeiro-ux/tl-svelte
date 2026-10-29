<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './menu.module.css'

	// A row for a single control, usually label + input
	let {
		children,
		title,
		class: className,
	}: { children?: Snippet; title?: string; class?: string } = $props()
</script>

<div class={['tla-control', styles.menuControlRow, className]} {title}>
	{@render children?.()}
</div>
