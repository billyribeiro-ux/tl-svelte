<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './menu.module.css'

	// Used to group together adjacent controls, ie switches or selects
	let { children }: { children?: Snippet } = $props()
</script>

<div class={styles.menuControlGroup}>{@render children?.()}</div>
