<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	/** @public */
	export interface TLUiToolbarButtonProps extends Omit<HTMLButtonAttributes, 'type' | 'children'> {
		/**
		 * Replaces React's `asChild`: render your own element and spread `props` on it.
		 */
		child?: Snippet<[{ props: Record<string, unknown> }]>
		children?: Snippet
		class?: string
		disabled?: boolean
		isActive?: boolean
		type: 'icon' | 'tool' | 'menu'
		tooltip?: string
		ref?: HTMLElement | null
	}
</script>

<script lang="ts">
	import { mergeProps, Toolbar } from 'bits-ui'
	import classnames from 'classnames'
	import SvelteDrawUiTooltip from './SvelteDrawUiTooltip.svelte'

	let {
		child: asChild,
		children,
		type,
		isActive,
		tooltip,
		class: className,
		ref = $bindable(null),
		...props
	}: TLUiToolbarButtonProps = $props()

	// `child` is optional; this wrapper adds the button classes when it is used.
	const buttonClass = $derived(classnames('tlui-button', `tlui-button__${type}`, className))
</script>

{#snippet wrappedChild({ props: childProps }: { props: Record<string, unknown> })}
	{@render asChild?.({ props: mergeProps(childProps, { class: buttonClass }) })}
{/snippet}

<SvelteDrawUiTooltip content={tooltip || props.title || undefined}>
	{#snippet child({ props: tooltipProps })}
		<Toolbar.Button
			bind:ref
			draggable={false}
			data-isactive={isActive}
			{...(mergeProps(props, tooltipProps) as Record<string, unknown>)}
			aria-label={props.title}
			title={undefined}
			class={buttonClass}
			child={asChild ? wrappedChild : undefined}
		>
			{@render children?.()}
		</Toolbar.Button>
	{/snippet}
</SvelteDrawUiTooltip>
