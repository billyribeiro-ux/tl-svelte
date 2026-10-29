<script lang="ts">
	import { CommentsMenuItem } from '@svelte-draw/commenting'
	import {
		SvelteDrawUiMenuActionItem,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuSubmenu,
		ZoomTo100MenuItem,
		ZoomToFitMenuItem,
		ZoomToSelectionMenuItem,
	} from 'svelte-draw'
	import { getIsCommentingEnabled } from '../../../hooks/useIsCommentingEnabled.svelte'

	/** svelte-draw's default View submenu plus a "Comments" show/hide toggle (its own group, signed-in
	 *  only). Rebuilt here because svelte-draw's `ViewSubmenu` is a fixed component with no slot to inject
	 *  into. */
	const commentingEnabled = getIsCommentingEnabled()
</script>

<SvelteDrawUiMenuSubmenu id="view" label="menu.view">
	<SvelteDrawUiMenuGroup id="view-actions">
		<SvelteDrawUiMenuActionItem actionId="zoom-in" />
		<SvelteDrawUiMenuActionItem actionId="zoom-out" />
		<ZoomTo100MenuItem />
		<ZoomToFitMenuItem />
		<ZoomToSelectionMenuItem />
	</SvelteDrawUiMenuGroup>
	{#if commentingEnabled.current}
		<SvelteDrawUiMenuGroup id="view-comments">
			<CommentsMenuItem />
		</SvelteDrawUiMenuGroup>
	{/if}
</SvelteDrawUiMenuSubmenu>
