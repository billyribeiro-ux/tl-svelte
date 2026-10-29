<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDebugMenuProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiDropdownMenuContent from '../primitives/SvelteDrawUiDropdownMenuContent.svelte'
	import SvelteDrawUiDropdownMenuRoot from '../primitives/SvelteDrawUiDropdownMenuRoot.svelte'
	import SvelteDrawUiDropdownMenuTrigger from '../primitives/SvelteDrawUiDropdownMenuTrigger.svelte'
	import DefaultDebugMenuContent from './DefaultDebugMenuContent.svelte'

	let { children }: TLUiDebugMenuProps = $props()

	const editor = getEditor()

	// While the debug menu is mounted, expose the editor on `window.editor` for
	// console-driven debugging. We remove it on unmount so the editor isn't
	// retained when debug mode is turned off.
	$effect(() => {
		const win = window as unknown as { editor?: typeof editor }
		win.editor = editor
		return () => {
			if (win.editor === editor) {
				delete win.editor
			}
		}
	})
</script>

<SvelteDrawUiDropdownMenuRoot id="debug">
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton {...props} type="icon" title="Debug menu">
				<SvelteDrawUiButtonIcon icon="dots-horizontal" />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<SvelteDrawUiDropdownMenuContent side="top" align="end" alignOffset={0}>
		<SvelteDrawUiMenuContextProvider type="menu" sourceId="debug-panel">
			{#if children}
				{@render children()}
			{:else}
				<DefaultDebugMenuContent />
			{/if}
		</SvelteDrawUiMenuContextProvider>
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
