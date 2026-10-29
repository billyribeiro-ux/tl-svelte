<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	/** @public */
	export interface TLUiToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children?: Snippet
		class?: string
		dir?: 'ltr' | 'rtl'
		label: string
		orientation?: 'horizontal' | 'vertical' | 'grid'
		tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
		ref?: HTMLElement | null
	}

	const LAYOUT_CLASS_BY_ORIENTATION = {
		horizontal: 'tlui-row',
		vertical: 'tlui-column',
		grid: 'tlui-grid',
	}
</script>

<script lang="ts">
	import classnames from 'classnames'
	import { Toolbar } from 'bits-ui'
	import { setSvelteDrawUiOrientation } from './layout.svelte'

	let {
		children,
		class: className,
		label,
		orientation = 'horizontal',
		tooltipSide,
		ref = $bindable(null),
		...props
	}: TLUiToolbarProps = $props()

	// The React version rendered `<Layout asChild><Toolbar.Root/></Layout>`: the layout class and
	// orientation context are applied to the toolbar element itself.
	setSvelteDrawUiOrientation(
		() => (orientation === 'vertical' ? 'vertical' : 'horizontal'),
		() => tooltipSide
	)
</script>

<Toolbar.Root
	bind:ref
	{...(props as Record<string, unknown>)}
	class={classnames(LAYOUT_CLASS_BY_ORIENTATION[orientation], 'tlui-toolbar', className)}
	aria-label={label}
	orientation={orientation === 'grid' ? 'horizontal' : orientation}
>
	{@render children?.()}
</Toolbar.Root>
