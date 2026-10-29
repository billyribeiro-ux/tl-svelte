<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiHelperButtonsProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import DefaultHelperButtonsContent from './DefaultHelperButtonsContent.svelte'

	let { children }: TLUiHelperButtonsProps = $props()
</script>

<div class="tlui-helper-buttons">
	<SvelteDrawUiMenuContextProvider type="helper-buttons" sourceId="helper-buttons">
		{#if children}
			{@render children()}
		{:else}
			<DefaultHelperButtonsContent />
		{/if}
	</SvelteDrawUiMenuContextProvider>
</div>
