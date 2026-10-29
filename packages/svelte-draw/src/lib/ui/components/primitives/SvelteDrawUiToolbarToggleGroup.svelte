<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	/** @public */
	export interface TLUiToolbarToggleGroupProps
		extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children?: Snippet
		class?: string
		dir?: 'ltr' | 'rtl'
		// TODO: fix up this type later
		value?: any
		/** Used as the initial value when `value` is not provided. */
		defaultValue?: any
		onValueChange?(value: any): void
		type: 'single' | 'multiple'
	}
</script>

<script lang="ts">
	import { Toolbar } from 'bits-ui'
	import classnames from 'classnames'

	let {
		children,
		class: className,
		type,
		value,
		defaultValue,
		onValueChange,
		...props
	}: TLUiToolbarToggleGroupProps = $props()
</script>

<!-- bits-ui's Toolbar.Group takes a `string` value for `single` and `string[]` for `multiple`. -->
<Toolbar.Group
	{type}
	{...props as object}
	value={(value ?? defaultValue) as never}
	onValueChange={onValueChange as never}
	class={classnames('tlui-toolbar-toggle-group', className)}
>
	{#snippet child({ props: groupProps })}
		<!-- Radix rendered role="group" here (https://github.com/radix-ui/primitives/issues/3188), so the
			React primitive forced role="radiogroup"; bits-ui also uses role="group". -->
		<div {...groupProps} role="radiogroup">
			{@render children?.()}
		</div>
	{/snippet}
</Toolbar.Group>
