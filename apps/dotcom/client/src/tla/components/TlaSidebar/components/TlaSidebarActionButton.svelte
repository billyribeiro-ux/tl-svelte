<script lang="ts">
	import type { Snippet } from 'svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import styles from '../sidebar.module.css'

	let {
		icon,
		label,
		onClick,
		testId,
	}: {
		icon?: string
		/** Plain text, or a snippet where the label is a `<F>`. */
		label: string | Snippet
		onClick(): void
		testId: string
	} = $props()
</script>

<button
	class={[styles.sidebarActionButton, styles.hoverable, 'tla-text_ui__regular']}
	onclick={onClick}
	data-testid={testId}
>
	{#if icon}<TlaIcon {icon} />{/if}
	<span class={styles.sidebarActionButtonLabel}>
		{#if typeof label === 'string'}{label}{:else}{@render label()}{/if}
	</span>
</button>
