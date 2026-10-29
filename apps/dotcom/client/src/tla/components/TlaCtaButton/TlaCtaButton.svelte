<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	export interface TlaCtaButtonProps extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet
		canvas?: boolean
		secondary?: boolean
		ref?: HTMLButtonElement | null
	}
</script>

<script lang="ts">
	import styles from './cta-button.module.css'

	let {
		class: className,
		canvas = false,
		secondary = false,
		children,
		ref = $bindable(null),
		...props
	}: TlaCtaButtonProps = $props()
</script>

<!-- The spread comes after the fixed attributes, as in React, so a caller's `type` wins. -->
<button
	bind:this={ref}
	type="button"
	draggable={false}
	class={[
		'tla-primary-button',
		styles.ctaButton,
		{ [styles.ctaButtonCanvas]: canvas, [styles.ctaButtonSecondary]: secondary },
		className,
	]}
	{...props}
>
	{@render children?.()}
</button>
