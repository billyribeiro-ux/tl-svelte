<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiMenuContextProvider,
	} from 'svelte-draw'
	import type { TLAppUiEventSource } from '../../utils/app-ui-events'
	import { TLA_MENU_POSITION } from '../tla-menu/tla-menu-position'
	import FileItems from './FileItems.svelte'

	let {
		children,
		source,
		fileId,
		workspaceId,
		onRenameAction,
		trigger,
	}: {
		/** Replaces the default `FileItems` as the menu's content. */
		children?: Snippet
		source: TLAppUiEventSource
		fileId: string
		workspaceId: string | null
		onRenameAction(): void
		/** The trigger element: render it and spread `props` on it (React took a `ReactNode`). */
		trigger: Snippet<[{ props: Record<string, unknown> }]>
	} = $props()

	const id = $props.id()
</script>

<SvelteDrawUiDropdownMenuRoot id={`file-menu-${fileId}-${source}-${id}`}>
	<SvelteDrawUiMenuContextProvider type="menu" sourceId="dialog">
		<SvelteDrawUiDropdownMenuTrigger child={trigger} />
		<!-- Sidebar menus hang ~8px over the sidebar's right edge, so they keep the shared
		     side/collision offsets but override alignOffset (the default is tuned for the
		     share/select menus, which would leave these looking inset). -->
		<SvelteDrawUiDropdownMenuContent
			side="bottom"
			align="end"
			{...TLA_MENU_POSITION}
			alignOffset={-16}
		>
			{#if children}
				{@render children()}
			{:else}
				<FileItems {source} {fileId} {onRenameAction} {workspaceId} />
			{/if}
		</SvelteDrawUiDropdownMenuContent>
	</SvelteDrawUiMenuContextProvider>
</SvelteDrawUiDropdownMenuRoot>
