<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'
	import styles from './admin.module.css'

	let {
		variant = 'secondary',
		isLoading,
		class: className,
		children,
		disabled,
		...rest
	}: {
		variant?: 'primary' | 'secondary' | 'danger'
		isLoading?: boolean
		children?: Snippet
	} & HTMLButtonAttributes = $props()

	const variantClass = $derived(
		variant === 'primary'
			? styles.btnPrimary
			: variant === 'danger'
				? styles.btnDanger
				: styles.btnSecondary
	)
</script>

<button
	{...rest}
	disabled={disabled || isLoading}
	class={[styles.btn, variantClass, className].filter(Boolean).join(' ')}
>
	{#if isLoading}…{:else}{@render children?.()}{/if}
</button>
