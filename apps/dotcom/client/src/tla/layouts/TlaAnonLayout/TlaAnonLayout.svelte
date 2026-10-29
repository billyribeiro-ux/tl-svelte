<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setupPreventAccidentalDrops } from '../../hooks/usePreventAccidentalDrops.svelte'
	import styles from './anon.module.css'

	let { children }: { children: Snippet } = $props()

	setupPreventAccidentalDrops()
</script>

<div class={styles.anonLayout}>
	<div class={styles.anonEditorWrapper}>{@render children()}</div>
</div>
