<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		actionsMenuTitle: { id: 'actions-menu.title', defaultMessage: 'Actions' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor, usePassThroughWheelEvents } from '@svelte-draw/svelte'
	import { PORTRAIT_BREAKPOINT } from '../constants'
	import { getBreakpoint } from '../context/breakpoints'
	import { getUiComponents } from '../context/components'
	import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiRow from './primitives/SvelteDrawUiRow.svelte'
	import SvelteDrawUiToolbar from './primitives/SvelteDrawUiToolbar.svelte'

	const breakpoint = getBreakpoint()
	const msg = getTranslation()
	const passThroughWheelEvents = usePassThroughWheelEvents()

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()

	const editor = getEditor()
	const isSinglePageMode = fromComputed('isSinglePageMode', () => editor.options.maxPages <= 1)

	const showQuickActions = $derived(
		editor.options.actionShortcutsLocation === 'menu'
			? true
			: editor.options.actionShortcutsLocation === 'toolbar'
				? false
				: breakpoint.current >= PORTRAIT_BREAKPOINT.TABLET
	)
</script>

{#if components.MainMenu || components.PageMenu || showQuickActions}
	{@const MainMenu = components.MainMenu}
	{@const PageMenu = components.PageMenu}
	{@const QuickActions = components.QuickActions}
	{@const ActionsMenu = components.ActionsMenu}
	<nav {@attach passThroughWheelEvents} class="tlui-menu-zone">
		<SvelteDrawUiRow>
			{#if MainMenu}<MainMenu />{/if}
			{#if PageMenu && !isSinglePageMode.current}<PageMenu />{/if}
			{#if showQuickActions}
				<SvelteDrawUiToolbar orientation="horizontal" label={msg(messages.actionsMenuTitle)}>
					{#if QuickActions}<QuickActions />{/if}
					{#if ActionsMenu}<ActionsMenu />{/if}
				</SvelteDrawUiToolbar>
			{/if}
		</SvelteDrawUiRow>
	</nav>
{/if}
