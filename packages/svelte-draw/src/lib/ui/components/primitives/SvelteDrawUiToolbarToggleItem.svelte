<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	/** @public */
	export interface TLUiToolbarToggleItemProps
		extends Omit<HTMLButtonAttributes, 'type' | 'children' | 'value'> {
		children?: Snippet
		class?: string
		type: 'icon' | 'tool'
		value: string
		tooltip?: TLUiTooltipContent
	}
</script>

<script lang="ts">
	import { mergeProps, Toolbar } from 'bits-ui'
	import classnames from 'classnames'
	import SvelteDrawUiTooltip from './SvelteDrawUiTooltip.svelte'
	import type { TLUiTooltipContent } from './tooltipManager'

	let {
		children,
		class: className,
		type,
		value,
		tooltip,
		...props
	}: TLUiToolbarToggleItemProps = $props()
</script>

<SvelteDrawUiTooltip content={tooltip || props.title || undefined}>
	{#snippet child({ props: tooltipProps })}
		<Toolbar.GroupItem
			{...(mergeProps(props, tooltipProps) as Record<string, unknown>)}
			title={undefined}
			class={classnames(
				'tlui-button',
				`tlui-button__${type}`,
				'tlui-toolbar-toggle-group-item',
				className
			)}
			{value}
		>
			{@render children?.()}
		</Toolbar.GroupItem>
	{/snippet}
</SvelteDrawUiTooltip>
