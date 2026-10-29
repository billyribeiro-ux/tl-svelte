<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './menu.module.css'

	// Used to section areas of the menu, ie links vs snapshots
	let { children }: { children?: Snippet } = $props()
</script>

<div class={styles.menuSection}>{@render children?.()}</div>
