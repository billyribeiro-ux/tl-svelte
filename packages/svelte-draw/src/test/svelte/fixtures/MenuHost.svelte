<script lang="ts">
	/**
	 * Renders `content` inside a menu context (and, by default, a toolbar), as the toolbar menus do.
	 * Tests only.
	 */
	import type { Component } from 'svelte'
	import type { TLUiEventSource } from '../../../lib/ui/context/events'
	import type { TLUiMenuContextType } from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuContext'
	import SvelteDrawUiMenuContextProvider from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiToolbar from '../../../lib/ui/components/primitives/SvelteDrawUiToolbar.svelte'

	let {
		type,
		sourceId,
		toolbar = true,
		content: Content,
		contentProps = {},
	}: {
		type: TLUiMenuContextType
		sourceId: TLUiEventSource
		toolbar?: boolean
		content: Component<any>
		contentProps?: Record<string, unknown>
	} = $props()
</script>

{#if toolbar}
	<SvelteDrawUiToolbar label="test">
		<SvelteDrawUiMenuContextProvider {type} {sourceId}>
			<Content {...contentProps} />
		</SvelteDrawUiMenuContextProvider>
	</SvelteDrawUiToolbar>
{:else}
	<SvelteDrawUiMenuContextProvider {type} {sourceId}>
		<Content {...contentProps} />
	</SvelteDrawUiMenuContextProvider>
{/if}
