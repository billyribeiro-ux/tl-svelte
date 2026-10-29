<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuSubContentProps {
		id?: string
		alignOffset?: number
		sideOffset?: number
		size?: 'tiny' | 'small' | 'medium' | 'wide'
		children: Snippet
	}
</script>

<script lang="ts">
	import { getContainer } from '@svelte-draw/svelte'
	import { DropdownMenu } from 'bits-ui'

	let {
		id,
		alignOffset = -1,
		sideOffset = -6,
		size = 'small',
		children,
	}: TLUiDropdownMenuSubContentProps = $props()

	const container = getContainer()
</script>

<DropdownMenu.Portal to={container}>
	<DropdownMenu.SubContent
		data-testid={id}
		class="tlui-menu tlui-menu__submenu__content"
		{alignOffset}
		{sideOffset}
		collisionPadding={4}
		data-size={size}
	>
		{@render children()}
	</DropdownMenu.SubContent>
</DropdownMenu.Portal>
