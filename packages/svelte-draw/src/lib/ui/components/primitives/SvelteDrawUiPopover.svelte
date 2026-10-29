<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiPopoverProps {
		id: string
		open?: boolean
		children: Snippet
		onOpenChange?(isOpen: boolean): void
		class?: string
	}
</script>

<script lang="ts">
	import classNames from 'classnames'
	import { Popover } from 'bits-ui'
	import { setContext } from 'svelte'
	import { createMenuIsOpen } from '../../hooks'

	let { id, children, onOpenChange, open, class: className }: TLUiPopoverProps = $props()

	const menu = createMenuIsOpen(
		() => id,
		(isOpen) => onOpenChange?.(isOpen)
	)

	// Lets the content close the popover synchronously on an outside pointerdown (see the content).
	setContext('svelte-draw-ui-popover-close', () => menu.onOpenChange(false))
</script>

<!-- `open || isOpen` allows debugging -->
<Popover.Root bind:open={() => !!open || menu.isOpen, (value) => menu.onOpenChange(value)}>
	<div class={classNames('tlui-popover', className)}>
		{@render children()}
	</div>
</Popover.Root>
