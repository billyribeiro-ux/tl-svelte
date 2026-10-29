<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiHelpMenuProps {
		children?: Snippet
	}

	const messages = defineMessages({
		helpMenuTitle: { id: 'help-menu.title', defaultMessage: 'Help and resources' },
	})
</script>

<script lang="ts">
	import { usePassThroughWheelEvents } from '@svelte-draw/svelte'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiDropdownMenuContent from '../primitives/SvelteDrawUiDropdownMenuContent.svelte'
	import SvelteDrawUiDropdownMenuRoot from '../primitives/SvelteDrawUiDropdownMenuRoot.svelte'
	import SvelteDrawUiDropdownMenuTrigger from '../primitives/SvelteDrawUiDropdownMenuTrigger.svelte'
	import DefaultHelpMenuContent from './DefaultHelpMenuContent.svelte'

	let { children }: TLUiHelpMenuProps = $props()

	const msg = getTranslation()
	const breakpoint = getBreakpoint()
	const passThroughWheelEvents = usePassThroughWheelEvents()
</script>

{#if breakpoint.current >= PORTRAIT_BREAKPOINT.MOBILE}
	<div {@attach passThroughWheelEvents} class="tlui-help-menu">
		<SvelteDrawUiDropdownMenuRoot id="help menu">
			<SvelteDrawUiDropdownMenuTrigger>
				{#snippet child({ props })}
					<SvelteDrawUiButton
						{...props}
						type="help"
						title={msg(messages.helpMenuTitle)}
						data-testid="help-menu.button"
					>
						<SvelteDrawUiButtonIcon icon="question-mark" small />
					</SvelteDrawUiButton>
				{/snippet}
			</SvelteDrawUiDropdownMenuTrigger>
			<SvelteDrawUiDropdownMenuContent side="top" align="end" alignOffset={0} sideOffset={8}>
				<SvelteDrawUiMenuContextProvider type="menu" sourceId="help-menu">
					<!-- If there's no menu content, then the user has set it to null, so skip rendering the menu. -->
					{#if children}
						{@render children()}
					{:else}
						<DefaultHelpMenuContent />
					{/if}
				</SvelteDrawUiMenuContextProvider>
			</SvelteDrawUiDropdownMenuContent>
		</SvelteDrawUiDropdownMenuRoot>
	</div>
{/if}
