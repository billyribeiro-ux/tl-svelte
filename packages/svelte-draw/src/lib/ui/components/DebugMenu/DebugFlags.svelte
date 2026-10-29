<script lang="ts" module>
	import type { DebugFlag } from '@svelte-draw/editor'

	/** @public */
	export interface DebugFlagsProps {
		customDebugFlags?: Record<string, DebugFlag<boolean>> | undefined
	}
</script>

<script lang="ts">
	import { debugFlags } from '@svelte-draw/editor'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import DebugFlagToggle from './DebugFlagToggle.svelte'

	let { customDebugFlags }: DebugFlagsProps = $props()

	const items = $derived(Object.values(customDebugFlags ?? debugFlags))
</script>

{#if items.length}
	<SvelteDrawUiMenuSubmenu id="debug flags" label="Debug flags">
		<SvelteDrawUiMenuGroup id="debug flags">
			{#each items as flag (flag.name)}
				<DebugFlagToggle {flag} />
			{/each}
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
{/if}
