<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuContentProps {
		id?: string
		class?: string
		side?: 'bottom' | 'top' | 'right' | 'left'
		align?: 'start' | 'center' | 'end'
		sideOffset?: number
		alignOffset?: number
		collisionPadding?: number
		children: Snippet
	}
</script>

<script lang="ts">
	import { getContainer } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import { DropdownMenu } from 'bits-ui'
	import { getDropdownMenuModal } from './dropdownMenuContext'

	let {
		class: className,
		side = 'bottom',
		align = 'start',
		sideOffset = 8,
		alignOffset = 8,
		collisionPadding = 4,
		children,
	}: TLUiDropdownMenuContentProps = $props()

	const container = getContainer()
	const modal = getDropdownMenuModal()
</script>

<DropdownMenu.Portal to={container}>
	<DropdownMenu.Content
		class={classNames('tlui-menu', className)}
		{side}
		{sideOffset}
		{align}
		{alignOffset}
		{collisionPadding}
		preventScroll={modal}
		trapFocus={modal}
	>
		{@render children()}
	</DropdownMenu.Content>
</DropdownMenu.Portal>
