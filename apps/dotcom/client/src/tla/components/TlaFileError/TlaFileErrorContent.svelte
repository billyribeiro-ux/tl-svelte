<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './TlaFileError.module.css'

	let {
		header,
		para1,
		para2,
		cta,
	}: { header: Snippet; para1: Snippet; para2?: Snippet; cta?: Snippet } = $props()
</script>

<div class={styles.container} data-testid="tla-error">
	<div class={styles.content}>
		<h1>{@render header()}</h1>
		<p>{@render para1()}</p>
		{#if para2}<p>{@render para2()}</p>{/if}
	</div>
	{@render cta?.()}
</div>
