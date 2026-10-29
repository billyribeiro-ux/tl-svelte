<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		navigationZoneTitle: { id: 'navigation-zone.title', defaultMessage: 'Navigation' },
		navigationZoneToggleMinimap: {
			id: 'navigation-zone.toggle-minimap',
			defaultMessage: 'Toggle minimap',
		},
	})
</script>

<script lang="ts">
	import { usePassThroughWheelEvents } from '@svelte-draw/svelte'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { unwrapLabel, getActions } from '../../context/actions.svelte'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getUiComponents } from '../../context/components'
	import { createLocalStorageState } from '../../hooks/useLocalStorageState.svelte'
	import { getDirection, getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { kbdStr } from '../../kbd-utils'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiToolbar from '../primitives/SvelteDrawUiToolbar.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'

	const actions = getActions()
	const msg = getTranslation()
	const dir = getDirection()
	const breakpoint = getBreakpoint()

	const passThroughWheelEvents = usePassThroughWheelEvents()

	const collapsed = createLocalStorageState('minimap', true)

	function toggleMinimap() {
		collapsed.update((s) => !s)
	}

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
	const ZoomMenu = $derived(components.ZoomMenu)
	const Minimap = $derived(components.Minimap)

	const isRtl = $derived(dir.current === 'rtl')
</script>

{#snippet minimapToggle()}
	{#if Minimap}
		<SvelteDrawUiToolbarButton
			type="icon"
			data-testid="minimap.toggle-button"
			title={msg(messages.navigationZoneToggleMinimap)}
			onclick={toggleMinimap}
		>
			<SvelteDrawUiButtonIcon
				small
				icon={collapsed.current !== isRtl ? 'chevron-right' : 'chevron-left'}
			/>
		</SvelteDrawUiToolbarButton>
	{/if}
{/snippet}

{#if breakpoint.current >= PORTRAIT_BREAKPOINT.MOBILE}
	<div {@attach passThroughWheelEvents} class="tlui-navigation-panel">
		<SvelteDrawUiToolbar orientation="horizontal" label={msg(messages.navigationZoneTitle)}>
			{#if ZoomMenu && breakpoint.current < PORTRAIT_BREAKPOINT.TABLET}
				<ZoomMenu />
			{:else}
				{#if isRtl}
					{@render minimapToggle()}
				{/if}
				{#if !collapsed.current}
					<SvelteDrawUiToolbarButton
						type="icon"
						data-testid="minimap.zoom-out"
						title={`${msg(unwrapLabel(actions['zoom-out'].label))} ${kbdStr(actions['zoom-out'].kbd!)}`}
						onclick={() => actions['zoom-out'].onSelect('navigation-zone')}
					>
						<SvelteDrawUiButtonIcon small icon="minus" />
					</SvelteDrawUiToolbarButton>
				{/if}
				{#if ZoomMenu}
					<ZoomMenu />
				{/if}
				{#if !collapsed.current}
					<SvelteDrawUiToolbarButton
						type="icon"
						data-testid="minimap.zoom-in"
						title={`${msg(unwrapLabel(actions['zoom-in'].label))} ${kbdStr(actions['zoom-in'].kbd!)}`}
						onclick={() => actions['zoom-in'].onSelect('navigation-zone')}
					>
						<SvelteDrawUiButtonIcon small icon="plus" />
					</SvelteDrawUiToolbarButton>
				{/if}
				{#if !isRtl}
					{@render minimapToggle()}
				{/if}
			{/if}
		</SvelteDrawUiToolbar>
		{#if Minimap && breakpoint.current >= PORTRAIT_BREAKPOINT.TABLET && !collapsed.current}
			<Minimap />
		{/if}
	</div>
{/if}
