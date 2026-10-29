<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @private */
	export interface TLUiContextMenuSubProps {
		id: string
		children: Snippet
	}
</script>

<script lang="ts">
	import { ContextMenu } from 'bits-ui'
	import { createMenuIsOpen } from '../../../hooks'

	let { id, children }: TLUiContextMenuSubProps = $props()

	const menu = createMenuIsOpen(() => id)
</script>

<ContextMenu.Sub bind:open={() => menu.isOpen, (value) => menu.onOpenChange(value)}>
	{@render children()}
</ContextMenu.Sub>
