<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiActionsMenuProps {
		children?: Snippet
	}

	const messages = defineMessages({
		actionsMenuTitle: { id: 'actions-menu.title', defaultMessage: 'Actions' },
	})
</script>

<script lang="ts">
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { createReadonly } from '../../hooks/useReadonly'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import { getSvelteDrawUiOrientation } from '../primitives/layout.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiPopover from '../primitives/SvelteDrawUiPopover.svelte'
	import SvelteDrawUiPopoverContent from '../primitives/SvelteDrawUiPopoverContent.svelte'
	import SvelteDrawUiPopoverTrigger from '../primitives/SvelteDrawUiPopoverTrigger.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'
	import DefaultActionsMenuContent from './DefaultActionsMenuContent.svelte'

	let { children }: TLUiActionsMenuProps = $props()

	const msg = getTranslation()
	const breakpoint = getBreakpoint()
	const isReadonlyMode = createReadonly()
	const orientationContext = getSvelteDrawUiOrientation()

	const side = $derived(
		orientationContext.orientation === 'horizontal'
			? breakpoint.current >= PORTRAIT_BREAKPOINT.TABLET
				? 'bottom'
				: 'top'
			: 'right'
	)
</script>

<!-- Every default action edits shapes, so in readonly mode the menu would open empty -->
{#if !isReadonlyMode.current}
	<SvelteDrawUiPopover id="actions-menu">
		<SvelteDrawUiPopoverTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiToolbarButton
					{...props}
					type="icon"
					data-testid="actions-menu.button"
					title={msg(messages.actionsMenuTitle)}
				>
					<SvelteDrawUiButtonIcon
						icon={orientationContext.orientation === 'horizontal' ? 'dots-vertical' : 'dots-horizontal'}
						small
					/>
				</SvelteDrawUiToolbarButton>
			{/snippet}
		</SvelteDrawUiPopoverTrigger>
		<SvelteDrawUiPopoverContent {side} sideOffset={6}>
			<SvelteDrawUiToolbar
				label={msg(messages.actionsMenuTitle)}
				class="tlui-actions-menu"
				data-testid="actions-menu.content"
				orientation="grid"
			>
				<SvelteDrawUiMenuContextProvider type="icons" sourceId="actions-menu">
					{#if children}
						{@render children()}
					{:else}
						<DefaultActionsMenuContent />
					{/if}
				</SvelteDrawUiMenuContextProvider>
			</SvelteDrawUiToolbar>
		</SvelteDrawUiPopoverContent>
	</SvelteDrawUiPopover>
{/if}
