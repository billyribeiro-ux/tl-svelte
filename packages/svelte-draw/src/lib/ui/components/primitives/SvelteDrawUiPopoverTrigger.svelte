<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiPopoverTriggerProps {
		/**
		 * Replaces React's `asChild` child: render the trigger element and spread `props` on it.
		 */
		child: Snippet<[{ props: Record<string, unknown> }]>
	}
</script>

<script lang="ts">
	import { Popover } from 'bits-ui'
	import { getDirection } from '../../hooks/useTranslation/useTranslation.svelte'

	let { child: childSnippet }: TLUiPopoverTriggerProps = $props()
	const dir = getDirection()
</script>

<Popover.Trigger>
	{#snippet child({ props })}
		<!-- bits-ui's Popover.Trigger has no `dir` prop; the attribute is set on the trigger instead. -->
		{@render childSnippet({ props: { ...props, dir: dir.current } })}
	{/snippet}
</Popover.Trigger>
