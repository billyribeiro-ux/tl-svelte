<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './menu.module.css'

	let { children }: { children?: Snippet } = $props()
</script>

<div class={styles.menuTabsTabs} role="tablist">
	{@render children?.()}
	<div class={styles.menuTabsLine}></div>
</div>
