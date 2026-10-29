<script lang="ts" module>
	import type { Snippet } from 'svelte'
	import type { TLUiEventSource } from '../../../context'
	import type { TLUiMenuContextType } from './SvelteDrawUiMenuContext'

	/** @public */
	export interface TLUiMenuContextProviderProps {
		type: TLUiMenuContextType
		sourceId: TLUiEventSource
		children: Snippet
	}
</script>

<script lang="ts">
	import { setSvelteDrawUiMenuContext } from './SvelteDrawUiMenuContext'

	let { type, sourceId, children }: TLUiMenuContextProviderProps = $props()

	setSvelteDrawUiMenuContext(
		() => type,
		() => sourceId
	)
</script>

{@render children()}
