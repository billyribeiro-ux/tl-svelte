<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiMainMenuProps {
		children?: Snippet
	}

	const messages = defineMessages({
		menuTitle: { id: 'menu.title', defaultMessage: 'Menu' },
	})
</script>

<script lang="ts">
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiDropdownMenuContent from '../primitives/SvelteDrawUiDropdownMenuContent.svelte'
	import SvelteDrawUiDropdownMenuRoot from '../primitives/SvelteDrawUiDropdownMenuRoot.svelte'
	import SvelteDrawUiDropdownMenuTrigger from '../primitives/SvelteDrawUiDropdownMenuTrigger.svelte'
	import DefaultMainMenuContent from './DefaultMainMenuContent.svelte'

	let { children }: TLUiMainMenuProps = $props()

	const msg = getTranslation()
</script>

<!--
	The menu content is either the children or the default content. If there's no menu content,
	then the user has set the MainMenu component to null, and this component isn't rendered.
-->
<SvelteDrawUiDropdownMenuRoot id="main menu" modal={false}>
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props })}
			<!-- `type` after the spread: the trigger's own `type="button"` would replace the button variant. -->
			<SvelteDrawUiButton
				{...props}
				type="icon"
				data-testid="main-menu.button"
				title={msg(messages.menuTitle)}
			>
				<SvelteDrawUiButtonIcon icon="menu" small />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<SvelteDrawUiDropdownMenuContent
		side="bottom"
		align="start"
		collisionPadding={4}
		alignOffset={0}
		sideOffset={6}
	>
		<SvelteDrawUiMenuContextProvider type="menu" sourceId="main-menu">
			{#if children}
				{@render children()}
			{:else}
				<DefaultMainMenuContent />
			{/if}
		</SvelteDrawUiMenuContextProvider>
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
