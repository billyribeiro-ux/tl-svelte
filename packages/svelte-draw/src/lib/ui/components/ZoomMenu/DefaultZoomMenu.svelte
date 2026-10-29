<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiZoomMenuProps {
		children?: Snippet
	}

	const messages = defineMessages({
		navigationZoneZoom: { id: 'navigation-zone.zoom', defaultMessage: 'Zoom' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiDropdownMenuContent from '../primitives/SvelteDrawUiDropdownMenuContent.svelte'
	import SvelteDrawUiDropdownMenuRoot from '../primitives/SvelteDrawUiDropdownMenuRoot.svelte'
	import SvelteDrawUiDropdownMenuTrigger from '../primitives/SvelteDrawUiDropdownMenuTrigger.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'
	import DefaultZoomMenuContent from './DefaultZoomMenuContent.svelte'

	let { children }: TLUiZoomMenuProps = $props()

	const editor = getEditor()
	const breakpoint = getBreakpoint()
	const msg = getTranslation()
	const zoom = fromComputed('zoom', () => editor.getZoomLevel())

	function handleDoubleClick() {
		editor.resetZoom(editor.getViewportScreenCenter(), {
			animation: { duration: editor.options.animationMediumMs },
		})
	}

	const value = $derived(`${Math.floor(zoom.current * 100)}%`)
</script>

<SvelteDrawUiDropdownMenuRoot id="zoom menu" modal={false}>
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props: triggerProps })}
			<SvelteDrawUiToolbarButton
				{...triggerProps}
				type="icon"
				aria-label={`${msg(messages.navigationZoneZoom)} — ${value}`}
				title={`${msg(messages.navigationZoneZoom)} — ${value}`}
				data-testid="minimap.zoom-menu-button"
				class="tlui-zoom-menu__button"
				ondblclick={handleDoubleClick}
			>
				{#if breakpoint.current >= PORTRAIT_BREAKPOINT.MOBILE}
					<span style="flex-grow: 0; text-align: center;">{value}</span>
				{/if}
			</SvelteDrawUiToolbarButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<SvelteDrawUiDropdownMenuContent side="top" align="start" alignOffset={0} sideOffset={8} collisionPadding={4}>
		<SvelteDrawUiMenuContextProvider type="menu" sourceId="zoom-menu">
			<!-- If there's no menu content, then the user has set it to null, so skip rendering the menu. -->
			{#if children}
				{@render children()}
			{:else}
				<DefaultZoomMenuContent />
			{/if}
		</SvelteDrawUiMenuContextProvider>
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
