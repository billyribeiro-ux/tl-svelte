<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuItemProps {
		noClose?: boolean
		/**
		 * Replaces React's `asChild` child: render the element (usually a `SvelteDrawUiButton`) that
		 * becomes the menu item and spread `props` on it.
		 */
		child: Snippet<[{ props: Record<string, unknown> }]>
	}
</script>

<script lang="ts">
	import { DropdownMenu, mergeProps } from 'bits-ui'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'

	let { noClose, child: childSnippet }: TLUiDropdownMenuItemProps = $props()
	const dir = getDirection()
</script>

<DropdownMenu.Item closeOnSelect={!noClose}>
	{#snippet child({ props })}
		{@render childSnippet({ props: mergeProps(props, { dir: dir.current }) })}
	{/snippet}
</DropdownMenu.Item>
