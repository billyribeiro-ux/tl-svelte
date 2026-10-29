<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiDropdownMenuTriggerProps {
		/**
		 * Replaces React's `asChild` child: render the trigger element and spread `props` on it.
		 */
		child: Snippet<[{ props: Record<string, unknown> }]>
	}
</script>

<script lang="ts">
	import { preventDefault } from '@svelte-draw/editor'
	import { DropdownMenu, mergeProps } from 'bits-ui'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'

	let { child: childSnippet }: TLUiDropdownMenuTriggerProps = $props()
	const dir = getDirection()
</script>

<DropdownMenu.Trigger>
	{#snippet child({ props })}
		<!-- Firefox fix: Stop the dropdown immediately closing after touch -->
		{@render childSnippet({
			props: mergeProps(props, { dir: dir.current, ontouchend: preventDefault }),
		})}
	{/snippet}
</DropdownMenu.Trigger>
