<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	export interface TlaButtonProps extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet
		isLoading?: boolean
		icon?: string
		iconRight?: string
		iconRightClassName?: string
		ghost?: boolean
		big?: boolean
		variant?: 'primary' | 'secondary' | 'cta'
		ref?: HTMLButtonElement | null
	}
</script>

<script lang="ts">
	import TlaIcon from '../TlaIcon/TlaIcon.svelte'
	import styles from './button.module.css'

	let {
		children,
		class: className = '',
		icon = '',
		iconRight = '',
		iconRightClassName = '',
		ghost = false,
		variant = 'primary',
		isLoading = false,
		big = false,
		onclick,
		ref = $bindable(null),
		...props
	}: TlaButtonProps = $props()
</script>

<button
	{...props}
	onclick={isLoading ? undefined : onclick}
	bind:this={ref}
	data-state={isLoading ? 'loading' : 'ready'}
	class={[
		'tla-button',
		styles.tlaButton,
		{
			[styles.cta]: variant === 'cta',
			[styles.primary]: variant === 'primary',
			[styles.secondary]: variant === 'secondary',
			[styles.ghost]: ghost,
			[styles.big]: big,
		},
		className,
	]}
>
	{#if isLoading && !iconRight}
		<div class={styles.spinner}>
			<TlaIcon class="tla-spinner" icon="spinner" />
		</div>
	{:else}
		{#if icon}<TlaIcon {icon} />{/if}
		{#if children}<span>{@render children()}</span>{/if}
		{#if iconRight}
			{#if isLoading}
				<div class={[styles.iconRight, iconRightClassName]}>
					<TlaIcon icon={iconRight} class={styles.spinner} />
				</div>
			{:else}
				<TlaIcon icon={iconRight} class={[styles.iconRight, iconRightClassName]} />
			{/if}
		{/if}
	{/if}
</button>
