<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuRootProps {
		id: string
		children: Snippet
		modal?: boolean
		debugOpen?: boolean
	}
</script>

<script lang="ts">
	import { DropdownMenu } from 'bits-ui'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'
	import { createMenuIsOpen } from '../../hooks'
	import { setDropdownMenuModal } from './dropdownMenuContext'

	let { id, children, modal = false, debugOpen = false }: TLUiDropdownMenuRootProps = $props()

	const menu = createMenuIsOpen(() => id)
	const dir = getDirection()

	setDropdownMenuModal(() => modal)
</script>

<DropdownMenu.Root
	bind:open={() => debugOpen || menu.isOpen, (value) => menu.onOpenChange(value)}
	dir={dir.current}
>
	{@render children()}
</DropdownMenu.Root>
