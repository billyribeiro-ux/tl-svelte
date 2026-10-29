<script lang="ts" module>
	import type { DebugFlag } from '@svelte-draw/editor'

	/** @public */
	export interface FeatureFlagsProps {
		customFeatureFlags?: Record<string, DebugFlag<boolean>> | undefined
	}
</script>

<script lang="ts">
	import { featureFlags } from '@svelte-draw/editor'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import DebugFlagToggle from './DebugFlagToggle.svelte'

	let { customFeatureFlags }: FeatureFlagsProps = $props()

	const items = $derived(Object.values(customFeatureFlags ?? featureFlags))
</script>

{#if items.length}
	<SvelteDrawUiMenuSubmenu id="feature flags" label="Feature flags">
		<SvelteDrawUiMenuGroup id="feature flags">
			{#each items as flag (flag.name)}
				<DebugFlagToggle {flag} />
			{/each}
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
{/if}
