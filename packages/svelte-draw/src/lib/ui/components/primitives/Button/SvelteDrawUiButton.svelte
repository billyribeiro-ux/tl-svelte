<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	/** @public */
	export interface TLUiButtonProps extends Omit<HTMLButtonAttributes, 'type' | 'children'> {
		isActive?: boolean
		type: 'normal' | 'primary' | 'danger' | 'low' | 'icon' | 'tool' | 'menu' | 'help'
		htmlButtonType?: 'button' | 'submit' | 'reset'
		tooltip?: string
		children?: Snippet
		ref?: HTMLButtonElement | null
	}

	const namedClassNamesSoThatICanGrepForThis = {
		normal: 'tlui-button__normal',
		primary: 'tlui-button__primary',
		danger: 'tlui-button__danger',
		low: 'tlui-button__low',
		icon: 'tlui-button__icon',
		tool: 'tlui-button__tool',
		menu: 'tlui-button__menu',
		help: 'tlui-button__help',
	}
</script>

<script lang="ts">
	import { mergeProps } from 'bits-ui'
	import classnames from 'classnames'
	import SvelteDrawUiTooltip from '../SvelteDrawUiTooltip.svelte'

	let {
		children,
		type,
		htmlButtonType,
		isActive,
		tooltip,
		ref = $bindable(null),
		class: className,
		title,
		'aria-label': ariaLabel,
		...props
	}: TLUiButtonProps = $props()
</script>

{#snippet button(extraProps: Record<string, unknown>)}
	<button
		bind:this={ref}
		type={htmlButtonType || 'button'}
		draggable={false}
		data-isactive={isActive}
		{...mergeProps(props, extraProps)}
		class={classnames('tlui-button', namedClassNamesSoThatICanGrepForThis[type], className)}
		aria-label={ariaLabel ?? title}
		title={tooltip ? undefined : title}
	>
		{@render children?.()}
	</button>
{/snippet}

{#if tooltip}
	<SvelteDrawUiTooltip content={tooltip}>
		{#snippet child({ props: tooltipProps })}
			{@render button(tooltipProps)}
		{/snippet}
	</SvelteDrawUiTooltip>
{:else}
	{@render button({})}
{/if}
