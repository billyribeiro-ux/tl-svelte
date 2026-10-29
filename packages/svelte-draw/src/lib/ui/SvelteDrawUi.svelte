<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { TLUiAssetUrlOverrides } from './assetUrls'
	import type { TLUiComponents } from './context/components'
	import type { TLUiContextProviderProps } from './context/SvelteDrawUiContextProvider.svelte'

	/** @public */
	export interface SvelteDrawUiProps extends Omit<TLUiContextProviderProps, 'children'> {
		/**
		 * The component's children.
		 */
		children?: Snippet

		/**
		 * Whether to hide the user interface and only display the canvas.
		 */
		hideUi?: boolean

		/**
		 * Overrides for the UI components.
		 */
		components?: TLUiComponents

		/**
		 * Additional items to add to the debug menu (will be deprecated)
		 */
		renderDebugMenuItems?: Snippet

		/** Asset URL override. */
		assetUrls?: TLUiAssetUrlOverrides
	}
</script>

<script lang="ts">
	import SvelteDrawUiContextProvider from './context/SvelteDrawUiContextProvider.svelte'
	import SvelteDrawUiInner from './SvelteDrawUiInner.svelte'

	/** @public */
	let {
		renderDebugMenuItems,
		children,
		hideUi,
		components,
		...rest
	}: SvelteDrawUiProps = $props()
</script>

<SvelteDrawUiContextProvider {...rest} {components}>
	<SvelteDrawUiInner {hideUi} {renderDebugMenuItems}>
		{@render children?.()}
	</SvelteDrawUiInner>
</SvelteDrawUiContextProvider>
