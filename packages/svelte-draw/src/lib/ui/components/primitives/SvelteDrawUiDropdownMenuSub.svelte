<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuSubProps {
		id: string
		children: Snippet
	}
</script>

<script lang="ts">
	import { DropdownMenu } from 'bits-ui'
	import { createMenuIsOpen } from '../../hooks'

	let { id, children }: TLUiDropdownMenuSubProps = $props()

	const menu = createMenuIsOpen(() => id)
</script>

<DropdownMenu.Sub bind:open={() => menu.isOpen, (value) => menu.onOpenChange(value)}>
	{@render children()}
</DropdownMenu.Sub>
