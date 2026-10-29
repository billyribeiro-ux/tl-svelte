<script lang="ts">
	import type { Snippet } from 'svelte'
	import styles from './menu.module.css'

	// A label for a control
	let { children, htmlFor }: { children?: Snippet; htmlFor: string } = $props()
</script>

<label class={[styles.menuLabel, 'tla-text_ui__medium']} for={htmlFor}>
	{@render children?.()}
</label>
