<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiSelectContentProps {
		children: Snippet
		side?: 'top' | 'bottom'
		align?: 'start' | 'center' | 'end'
		class?: string
	}
</script>

<script lang="ts">
	import { getContainer } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import { Select } from 'bits-ui'

	/**
	 * The dropdown content container for select items.
	 *
	 * @public
	 */
	let { children, side = 'bottom', align = 'start', class: className }: TLUiSelectContentProps =
		$props()

	const container = getContainer()
</script>

<Select.Portal to={container}>
	<Select.Content
		class={classNames('tlui-menu tlui-select__content', className)}
		{side}
		{align}
		sideOffset={4}
		collisionPadding={4}
	>
		<Select.Viewport class="tlui-select__viewport">
			{@render children()}
		</Select.Viewport>
	</Select.Content>
</Select.Portal>
