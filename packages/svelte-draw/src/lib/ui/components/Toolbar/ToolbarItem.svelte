<script lang="ts" module>
	/** @public */
	export interface ToolbarItemProps {
		tool: string
	}
</script>

<script lang="ts">
	import { getTools } from '../../hooks/useTools.svelte'
	import SvelteDrawUiMenuToolItem from '../primitives/menus/SvelteDrawUiMenuToolItem.svelte'
	import { createIsToolSelected } from './useIsToolSelected.svelte'

	let { tool }: ToolbarItemProps = $props()

	const tools = getTools()
	const isSelected = createIsToolSelected(() => tools.current[tool])
</script>

<SvelteDrawUiMenuToolItem toolId={tool} isSelected={isSelected.current} />
