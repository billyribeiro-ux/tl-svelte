<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface DefaultToolbarProps {
		children?: Snippet
		orientation?: 'horizontal' | 'vertical'
		minItems?: number
		minSizePx?: number
		maxItems?: number
		maxSizePx?: number
	}

	const messages = defineMessages({
		actionsMenuTitle: { id: 'actions-menu.title', defaultMessage: 'Actions' },
	})
</script>

<script lang="ts">
	import { fromComputed, getEditor, usePassThroughWheelEvents } from '@svelte-draw/svelte'
	import classNames from 'classnames'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getUiComponents } from '../../context/components'
	import { createReadonly } from '../../hooks/useReadonly'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import MobileStylePanel from '../MobileStylePanel.svelte'
	import SvelteDrawUiOrientationProvider from '../primitives/SvelteDrawUiOrientationProvider.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import DefaultToolbarContent from './DefaultToolbarContent.svelte'
	import OverflowingToolbar from './OverflowingToolbar.svelte'
	import ToggleToolLockedButton from './ToggleToolLockedButton.svelte'


	/**
	 * The default toolbar for the editor. `children` defaults to the `DefaultToolbarContent` component.
	 * Depending on the screen size, the children will overflow into a drop-down menu, with the most
	 * recently active item from the overflow being shown in the main toolbar.
	 *
	 * @public
	 */
	let {
		children,
		orientation = 'horizontal',
		minItems = 4,
		minSizePx = 310,
		maxItems = 8,
		maxSizePx = 470,
	}: DefaultToolbarProps = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const breakpoint = getBreakpoint()
	const isReadonlyMode = createReadonly()
	const activeToolId = fromComputed('current tool id', () => editor.getCurrentToolId())

	const passThroughWheelEvents = usePassThroughWheelEvents()

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
	const ActionsMenu = $derived(components.ActionsMenu)
	const QuickActions = $derived(components.QuickActions)

	const showQuickActions = $derived(
		editor.options.actionShortcutsLocation === 'menu'
			? false
			: editor.options.actionShortcutsLocation === 'toolbar'
				? true
				: breakpoint.current < PORTRAIT_BREAKPOINT.TABLET
	)
</script>

{#snippet toolbarContent()}
	{#if children}
		{@render children()}
	{:else}
		<DefaultToolbarContent />
	{/if}
{/snippet}

<SvelteDrawUiOrientationProvider
	{orientation}
	tooltipSide={orientation === 'horizontal' ? 'top' : 'right'}
>
	<div
		{@attach passThroughWheelEvents}
		class={classNames('tlui-main-toolbar', `tlui-main-toolbar--${orientation}`)}
	>
		<div class="tlui-main-toolbar__inner">
			<div class="tlui-main-toolbar__left">
				{#if !isReadonlyMode.current}
					<div class="tlui-main-toolbar__extras">
						{#if showQuickActions}
							<SvelteDrawUiToolbar
								{orientation}
								class="tlui-main-toolbar__extras__controls"
								label={msg(messages.actionsMenuTitle)}
							>
								{#if QuickActions}
									<QuickActions />
								{/if}
								{#if ActionsMenu}
									<ActionsMenu />
								{/if}
							</SvelteDrawUiToolbar>
						{/if}
						<ToggleToolLockedButton activeToolId={activeToolId.current} />
					</div>
				{/if}
				<OverflowingToolbar
					{orientation}
					sizingParentClassName="tlui-main-toolbar"
					{minItems}
					{maxItems}
					{minSizePx}
					{maxSizePx}
				>
					{@render toolbarContent()}
				</OverflowingToolbar>
			</div>
			{#if breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM && !isReadonlyMode.current}
				<div class="tlui-main-toolbar__tools tlui-main-toolbar__mobile-style-panel">
					<MobileStylePanel />
				</div>
			{/if}
		</div>
	</div>
</SvelteDrawUiOrientationProvider>
