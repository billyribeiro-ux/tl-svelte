<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	/** @public */
	export interface TLUiLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children?: Snippet
		tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
		/**
		 * Replaces React's `asChild`. When provided, it is rendered instead of the `div` and receives
		 * the props (class, ...) that must be spread on the element you render.
		 */
		child?: Snippet<[{ props: Record<string, unknown> }]>
		ref?: HTMLDivElement | null
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import { setSvelteDrawUiOrientation } from './layout.svelte'

	// Internal: shared implementation of SvelteDrawUiRow / SvelteDrawUiColumn / SvelteDrawUiGrid.
	let {
		orientation,
		layoutClassName,
		tooltipSide,
		child,
		children,
		class: className,
		ref = $bindable(null),
		...rest
	}: TLUiLayoutProps & {
		orientation: 'horizontal' | 'vertical'
		layoutClassName: string
	} = $props()

	setSvelteDrawUiOrientation(
		() => orientation,
		() => tooltipSide
	)

	const mergedProps = $derived({ ...rest, class: classNames(layoutClassName, className) })
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
