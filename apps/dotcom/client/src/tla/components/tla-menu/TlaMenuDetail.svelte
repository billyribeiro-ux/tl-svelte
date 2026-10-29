<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './menu.module.css'

	// A detail
	let { children }: { children?: Snippet } = $props()
</script>

<div class={[styles.menuDetailCentered, 'tla-text_ui__small']}>{@render children?.()}</div>
