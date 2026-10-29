<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './editor.module.css'

	let { children }: { children: Snippet } = $props()
</script>

<div class={styles.editor} data-testid="tla-editor">
	{@render children()}
</div>
