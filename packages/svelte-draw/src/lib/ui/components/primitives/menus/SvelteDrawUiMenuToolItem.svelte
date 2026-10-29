<script lang="ts" module>
	import type { TLUiMenuItemProps } from './SvelteDrawUiMenuItem.svelte'

	/** @public */
	export type TLUiMenuToolItemProps = {
		toolId?: string
	} & Pick<TLUiMenuItemProps, 'isSelected' | 'disabled'>
</script>

<script lang="ts">
	import { getTools } from '../../../hooks'
	import SvelteDrawUiMenuItem from './SvelteDrawUiMenuItem.svelte'

	let { toolId = '', ...rest }: TLUiMenuToolItemProps = $props()

	const tools = getTools()
	const tool = $derived(tools.current[toolId])
</script>

{#if tool}
	<SvelteDrawUiMenuItem {...tool as TLUiMenuItemProps} {...rest} />
{/if}
